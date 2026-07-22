import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { GroupDto, GroupDetailDto } from './dto/group.dto'
import { userNameSelect } from '../common/prisma-selects/user-name.select'

@Injectable()
export class GroupService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<GroupDto[]> {
        const groups = await this.prisma.group.findMany({
            include: {
                coach: {
                    select: {
                        id: true,
                        user: {
                            select: userNameSelect,
                        },
                    },
                },
                _count: { select: { athletes: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            coach: {
                id: group.coach.id,
                firstName: group.coach.user.firstName,
                lastName: group.coach.user.lastName,
                email: group.coach.user.email,
            },
            athleteCount: group._count.athletes,
        }))
    }

    async findOne(id: string): Promise<GroupDetailDto> {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                coach: {
                    select: {
                        id: true,
                        user: {
                            select: userNameSelect,
                        },
                    },
                },
                athletes: {
                    where: { leftAt: null },
                    select: {
                        athlete: {
                            select: {
                                id: true,
                                user: {
                                    select: userNameSelect,
                                },
                            },
                        },
                    },
                },
            },
        })
        if (!group) {
            throw new NotFoundException('Group not found')
        }

        return {
            id: group.id,
            name: group.name,
            description: group.description,
            coach: {
                id: group.coach.id,
                firstName: group.coach.user.firstName,
                lastName: group.coach.user.lastName,
                email: group.coach.user.email,
            },
            athleteCount: group.athletes.length,
            members: group.athletes.map((ga) => ({
                id: ga.athlete.id,
                firstName: ga.athlete.user.firstName,
                lastName: ga.athlete.user.lastName,
                email: ga.athlete.user.email,
            })),
        }
    }

    async create(dto: CreateGroupDto): Promise<GroupDto> {
        const coach = await this.prisma.coach.findUnique({
            where: { id: dto.coachId },
        })
        if (!coach) {
            throw new NotFoundException('Coach not found')
        }

        const group = await this.prisma.group.create({
            data: {
                name: dto.name,
                description: dto.description,
                coachId: dto.coachId,
            },
            include: {
                coach: {
                    select: {
                        id: true,
                        user: {
                            select: userNameSelect,
                        },
                    },
                },
            },
        })

        return {
            id: group.id,
            name: group.name,
            description: group.description,
            coach: {
                id: group.coach.id,
                firstName: group.coach.user.firstName,
                lastName: group.coach.user.lastName,
                email: group.coach.user.email,
            },
            athleteCount: 0,
        }
    }

    async update(id: string, dto: UpdateGroupDto): Promise<GroupDto> {
        const group = await this.prisma.group.findUnique({ where: { id } })
        if (!group) {
            throw new NotFoundException('Group not found')
        }
        if (dto.coachId) {
            const coach = await this.prisma.coach.findUnique({
                where: { id: dto.coachId },
            })
            if (!coach) {
                throw new NotFoundException('Coach not found')
            }
        }

        const updated = await this.prisma.group.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                coachId: dto.coachId,
            },
            include: {
                coach: {
                    select: {
                        id: true,
                        user: {
                            select: userNameSelect,
                        },
                    },
                },
                _count: { select: { athletes: true } },
            },
        })

        return {
            id: updated.id,
            name: updated.name,
            description: updated.description,
            coach: {
                id: updated.coach.id,
                firstName: updated.coach.user.firstName,
                lastName: updated.coach.user.lastName,
                email: updated.coach.user.email,
            },
            athleteCount: updated._count.athletes,
        }
    }

    async remove(id: string): Promise<void> {
        const group = await this.prisma.group.findUnique({ where: { id } })
        if (!group) {
            throw new NotFoundException('Group not found')
        }
        await this.prisma.group.delete({ where: { id } })
    }
}
