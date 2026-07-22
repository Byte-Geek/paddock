import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { EventDto, EventDetailDto } from './dto/event.dto'
import { formatFullName } from '../common/utils/name.util'
import {
    userNameSelect,
    userNameWithIdSelect,
} from '../common/prisma-selects/user-name.select'

@Injectable()
export class EventService {
    constructor(private readonly prisma: PrismaService) {}

    private async syncScheduledTransitions(): Promise<void> {
        await this.prisma.event.updateMany({
            where: { status: 'PUBLISHED', startDate: { lte: new Date() } },
            data: { status: 'ONGOING' },
        })
    }

    async findAll(requesterRole?: string): Promise<EventDto[]> {
        await this.syncScheduledTransitions()

        const events = await this.prisma.event.findMany({
            where:
                requesterRole === 'ADMIN'
                    ? undefined
                    : { status: { not: 'DRAFT' } },
            include: {
                categories: {
                    select: {
                        participations: { select: { athleteId: true } },
                    },
                },
                secretaries: {
                    select: {
                        user: {
                            select: userNameWithIdSelect,
                        },
                    },
                },
            },
            orderBy: { startDate: 'desc' },
        })

        return events.map((event) => {
            const athleteIds = new Set(
                event.categories.flatMap((c) =>
                    c.participations.map((p) => p.athleteId),
                ),
            )
            return {
                id: event.id,
                name: event.name,
                location: event.location,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                status: event.status,
                participantCount: athleteIds.size,
                secretaries: event.secretaries.map((s) => s.user),
            }
        })
    }

    async findOne(
        id: string,
        requesterRole?: string
    ): Promise<EventDetailDto> {
        await this.syncScheduledTransitions()

        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                secretaries: {
                    select: {
                        user: {
                            select: userNameWithIdSelect,
                        },
                    },
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                        participations: {
                            select: {
                                id: true,
                                athleteId: true,
                                horseName: true,
                                finalScore: true,
                                rank: true,
                                status: true,
                                athlete: {
                                    select: {
                                        user: {
                                            select: userNameSelect,
                                        },
                                    },
                                },
                            },
                            orderBy: { rank: 'asc' },
                        },
                    },
                },
            },
        })
        if (!event || (event.status === 'DRAFT' && requesterRole !== 'ADMIN')) {
            throw new NotFoundException('Event not found')
        }

        const athleteIds = new Set(
            event.categories.flatMap((c) =>
                c.participations.map((p) => p.athleteId),
            ),
        )

        return {
            id: event.id,
            name: event.name,
            location: event.location,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status,
            participantCount: athleteIds.size,
            secretaries: event.secretaries.map((s) => s.user),
            categories: event.categories.map((category) => ({
                id: category.id,
                name: category.name,
                participations: category.participations.map((p) => ({
                    id: p.id,
                    athleteId: p.athleteId,
                    athleteName: formatFullName(
                        p.athlete.user.firstName,
                        p.athlete.user.lastName,
                        p.athlete.user.email
                    ),
                    horseName: p.horseName,
                    finalScore: p.finalScore?.toString() ?? null,
                    rank: p.rank,
                    status: p.status,
                })),
            })),
        }
    }

    async create(dto: CreateEventDto): Promise<EventDto> {
        const event = await this.prisma.event.create({
            data: {
                name: dto.name,
                location: dto.location,
                description: dto.description,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                status: dto.status,
                secretaries: dto.secretaryIds?.length
                    ? {
                          create: dto.secretaryIds.map((userId) => ({
                              userId,
                          })),
                      }
                    : undefined,
            },
            include: {
                secretaries: {
                    select: {
                        user: {
                            select: userNameWithIdSelect,
                        },
                    },
                },
            },
        })

        return {
            id: event.id,
            name: event.name,
            location: event.location,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status,
            participantCount: 0,
            secretaries: event.secretaries.map((s) => s.user),
        }
    }

    async update(id: string, dto: UpdateEventDto): Promise<EventDto> {
        const event = await this.prisma.event.findUnique({ where: { id } })
        if (!event) {
            throw new NotFoundException('Event not found')
        }

        const editsData =
            dto.name !== undefined ||
            dto.location !== undefined ||
            dto.description !== undefined ||
            dto.startDate !== undefined ||
            dto.endDate !== undefined ||
            dto.secretaryIds !== undefined
        if (event.status !== 'DRAFT' && editsData) {
            throw new BadRequestException(
                'Datele competiției nu mai pot fi modificate. Trece competiția înapoi în ciornă pentru a face modificări.'
            )
        }

        const updated = await this.prisma.event.update({
            where: { id },
            data: {
                name: dto.name,
                location: dto.location,
                description: dto.description,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                status: dto.status,
                secretaries: dto.secretaryIds
                    ? {
                          deleteMany: {},
                          create: dto.secretaryIds.map((userId) => ({
                              userId,
                          })),
                      }
                    : undefined,
            },
            include: {
                categories: {
                    select: {
                        participations: { select: { athleteId: true } },
                    },
                },
                secretaries: {
                    select: {
                        user: {
                            select: userNameWithIdSelect,
                        },
                    },
                },
            },
        })

        const athleteIds = new Set(
            updated.categories.flatMap((c) =>
                c.participations.map((p) => p.athleteId),
            ),
        )

        return {
            id: updated.id,
            name: updated.name,
            location: updated.location,
            description: updated.description,
            startDate: updated.startDate,
            endDate: updated.endDate,
            status: updated.status,
            participantCount: athleteIds.size,
            secretaries: updated.secretaries.map((s) => s.user),
        }
    }

    async remove(id: string): Promise<void> {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { _count: { select: { categories: true } } },
        })
        if (!event) {
            throw new NotFoundException('Event not found')
        }
        if (event._count.categories > 0) {
            throw new BadRequestException(
                'Cannot delete an event that has categories with results. Remove the categories first.',
            )
        }

        await this.prisma.event.delete({ where: { id } })
    }
}
