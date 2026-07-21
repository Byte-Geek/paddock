import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma.service'
import { CreateAthleteDto } from './dto/create-athlete.dto'
import { UpdateAthleteDto } from './dto/update-athlete.dto'
import { AthleteDto } from './dto/athlete.dto'

@Injectable()
export class AthleteService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<AthleteDto[]> {
        const athletes = await this.prisma.athlete.findMany({
            where: { user: { role: 'ATHLETE' } },
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                groups: {
                    where: { leftAt: null },
                    select: { group: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return athletes.map((athlete) => ({
            id: athlete.id,
            firstName: athlete.user.firstName,
            lastName: athlete.user.lastName,
            email: athlete.user.email,
            groups: athlete.groups.map((g) => g.group),
        }))
    }

    async create(dto: CreateAthleteDto): Promise<AthleteDto> {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (existing) {
            throw new ConflictException('Email already in use')
        }

        if (dto.groupId) {
            const group = await this.prisma.group.findUnique({
                where: { id: dto.groupId },
            })
            if (!group) {
                throw new NotFoundException('Group not found')
            }
        }

        const hashed = await bcrypt.hash(dto.password, 10)
        const athlete = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: 'ATHLETE',
                athlete: {
                    create: dto.groupId
                        ? { groups: { create: { groupId: dto.groupId } } }
                        : {},
                },
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                athlete: {
                    select: {
                        id: true,
                        groups: {
                            where: { leftAt: null },
                            select: {
                                group: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        })

        return {
            id: athlete.athlete!.id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            email: athlete.email,
            groups: athlete.athlete!.groups.map((g) => g.group),
        }
    }

    async update(id: string, dto: UpdateAthleteDto): Promise<AthleteDto> {
        const athlete = await this.prisma.athlete.findUnique({
            where: { id },
        })
        if (!athlete) {
            throw new NotFoundException('Athlete not found')
        }

        if (dto.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            })
            if (existing && existing.id !== athlete.userId) {
                throw new ConflictException('Email already in use')
            }
        }

        const updated = await this.prisma.user.update({
            where: { id: athlete.userId },
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                athlete: {
                    select: {
                        id: true,
                        groups: {
                            where: { leftAt: null },
                            select: {
                                group: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        })

        return {
            id: updated.athlete!.id,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email,
            groups: updated.athlete!.groups.map((g) => g.group),
        }
    }

    async remove(id: string): Promise<void> {
        const athlete = await this.prisma.athlete.findUnique({
            where: { id },
            include: { _count: { select: { participations: true } } },
        })
        if (!athlete) {
            throw new NotFoundException('Athlete not found')
        }
        if (athlete._count.participations > 0) {
            throw new BadRequestException(
                'Cannot delete an athlete with recorded participations.'
            )
        }

        await this.prisma.user.delete({ where: { id: athlete.userId } })
    }
}
