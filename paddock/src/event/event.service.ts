import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { EventDto, EventDetailDto } from './dto/event.dto'

@Injectable()
export class EventService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<EventDto[]> {
        const events = await this.prisma.event.findMany({
            include: {
                categories: {
                    select: {
                        participations: { select: { athleteId: true } },
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
            }
        })
    }

    async findOne(id: string): Promise<EventDetailDto> {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
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
                                            select: {
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                            },
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
        if (!event) {
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
            categories: event.categories.map((category) => ({
                id: category.id,
                name: category.name,
                participations: category.participations.map((p) => ({
                    id: p.id,
                    athleteId: p.athleteId,
                    athleteName:
                        `${p.athlete.user.firstName ?? ''} ${p.athlete.user.lastName ?? ''}`.trim() ||
                        p.athlete.user.email,
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
        }
    }

    async update(id: string, dto: UpdateEventDto): Promise<EventDto> {
        const event = await this.prisma.event.findUnique({ where: { id } })
        if (!event) {
            throw new NotFoundException('Event not found')
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
            },
            include: {
                categories: {
                    select: {
                        participations: { select: { athleteId: true } },
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
