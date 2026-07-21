import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma.service'
import { CreateCoachDto } from './dto/create-coach.dto'
import { UpdateCoachDto } from './dto/update-coach.dto'
import { CoachDto } from './dto/coach.dto'

@Injectable()
export class CoachService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<CoachDto[]> {
        const coaches = await this.prisma.coach.findMany({
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                groups: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return coaches.map((coach) => ({
            id: coach.id,
            firstName: coach.user.firstName,
            lastName: coach.user.lastName,
            email: coach.user.email,
            groups: coach.groups,
        }))
    }

    async create(dto: CreateCoachDto): Promise<CoachDto> {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (existing) {
            throw new ConflictException('Email already in use')
        }

        const hashed = await bcrypt.hash(dto.password, 10)
        const coach = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: 'COACH',
                coach: { create: {} },
            },
            select: {
                coach: {
                    select: {
                        id: true,
                        groups: { select: { id: true, name: true } },
                    },
                },
                firstName: true,
                lastName: true,
                email: true,
            },
        })

        return {
            id: coach.coach!.id,
            firstName: coach.firstName,
            lastName: coach.lastName,
            email: coach.email,
            groups: coach.coach!.groups,
        }
    }

    async update(id: string, dto: UpdateCoachDto): Promise<CoachDto> {
        const coach = await this.prisma.coach.findUnique({
            where: { id },
        })
        if (!coach) {
            throw new NotFoundException('Coach not found')
        }

        if (dto.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            })
            if (existing && existing.id !== coach.userId) {
                throw new ConflictException('Email already in use')
            }
        }

        const updated = await this.prisma.user.update({
            where: { id: coach.userId },
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                coach: {
                    select: {
                        id: true,
                        groups: { select: { id: true, name: true } },
                    },
                },
            },
        })

        return {
            id: updated.coach!.id,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email,
            groups: updated.coach!.groups,
        }
    }

    async remove(id: string): Promise<void> {
        const coach = await this.prisma.coach.findUnique({
            where: { id },
            include: { _count: { select: { groups: true } } },
        })
        if (!coach) {
            throw new NotFoundException('Coach not found')
        }
        if (coach._count.groups > 0) {
            throw new BadRequestException(
                'Cannot delete a coach who still has groups assigned. Reassign or delete their groups first.'
            )
        }

        await this.prisma.user.delete({ where: { id: coach.userId } })
    }
}
