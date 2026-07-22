import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CreateRefereeDto } from './dto/create-referee.dto'
import { CreateParticipationDto } from './dto/create-participation.dto'
import { CategoryDto, CategoryDetailDto } from './dto/category.dto'

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllForEvent(
        eventId: string,
        requesterRole?: string
    ): Promise<CategoryDto[]> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { status: true },
        })
        if (!event || (event.status === 'DRAFT' && requesterRole !== 'ADMIN')) {
            throw new NotFoundException('Event not found')
        }

        const categories = await this.prisma.category.findMany({
            where: { eventId },
            include: {
                event: { select: { name: true, status: true } },
                protocolTemplate: { select: { name: true } },
                _count: {
                    select: { referees: true, participations: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return categories.map((c) => ({
            id: c.id,
            name: c.name,
            eventId: c.eventId,
            eventName: c.event.name,
            eventStatus: c.event.status,
            protocolTemplateId: c.protocolTemplateId,
            protocolTemplateName: c.protocolTemplate.name,
            refereeCount: c._count.referees,
            participationCount: c._count.participations,
        }))
    }

    async findOne(
        id: string,
        requesterRole?: string
    ): Promise<CategoryDetailDto> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                event: { select: { name: true, status: true } },
                protocolTemplate: {
                    select: {
                        name: true,
                        elements: { orderBy: { order: 'asc' } },
                    },
                },
                referees: true,
                participations: {
                    include: { athlete: { include: { user: true } } },
                    orderBy: { participationNumber: 'asc' },
                },
            },
        })
        if (
            !category ||
            (category.event.status === 'DRAFT' && requesterRole !== 'ADMIN')
        ) {
            throw new NotFoundException('Category not found')
        }

        return {
            id: category.id,
            name: category.name,
            eventId: category.eventId,
            eventName: category.event.name,
            eventStatus: category.event.status,
            protocolTemplateId: category.protocolTemplateId,
            protocolTemplateName: category.protocolTemplate.name,
            refereeCount: category.referees.length,
            participationCount: category.participations.length,
            elements: category.protocolTemplate.elements.map((el) => ({
                id: el.id,
                order: el.order,
                number: el.number,
                letters: el.letters,
                name: el.name,
                judgingCriteria: el.judgingCriteria,
                maxScore: el.maxScore.toString(),
                coefficient: el.coefficient.toString(),
            })),
            referees: category.referees.map((r) => ({
                id: r.id,
                firstName: r.firstName,
                lastName: r.lastName,
                letterCode: r.letterCode,
                position: r.position,
            })),
            participations: category.participations.map((p) => ({
                id: p.id,
                athleteId: p.athleteId,
                athleteName:
                    `${p.athlete.user.firstName ?? ''} ${p.athlete.user.lastName ?? ''}`.trim() ||
                    p.athlete.user.email,
                horseName: p.horseName,
                participationNumber: p.participationNumber,
                finalScore: p.finalScore?.toString() ?? null,
                rank: p.rank,
                status: p.status,
            })),
        }
    }

    async create(eventId: string, dto: CreateCategoryDto): Promise<CategoryDto> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { status: true },
        })
        if (!event) {
            throw new NotFoundException('Event not found')
        }
        if (event.status !== 'DRAFT') {
            throw new BadRequestException(
                'Categoriile pot fi create doar cât timp competiția este în ciornă.'
            )
        }

        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id: dto.protocolTemplateId },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }

        const category = await this.prisma.category.create({
            data: {
                eventId,
                name: dto.name,
                protocolTemplateId: dto.protocolTemplateId,
            },
            include: {
                event: { select: { name: true, status: true } },
                protocolTemplate: { select: { name: true } },
            },
        })

        return {
            id: category.id,
            name: category.name,
            eventId: category.eventId,
            eventStatus: category.event.status,
            eventName: category.event.name,
            protocolTemplateId: category.protocolTemplateId,
            protocolTemplateName: category.protocolTemplate.name,
            refereeCount: 0,
            participationCount: 0,
        }
    }

    async update(
        categoryId: string,
        dto: UpdateCategoryDto
    ): Promise<CategoryDto> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { event: { select: { status: true } } },
        })
        if (!category) {
            throw new NotFoundException('Category not found')
        }
        if (category.event.status !== 'DRAFT') {
            throw new BadRequestException(
                'Categoria poate fi editată doar cât timp competiția este în ciornă.'
            )
        }

        if (dto.protocolTemplateId) {
            const template = await this.prisma.protocolTemplate.findUnique({
                where: { id: dto.protocolTemplateId },
            })
            if (!template) {
                throw new NotFoundException('Protocol template not found')
            }
        }

        const updated = await this.prisma.category.update({
            where: { id: categoryId },
            data: {
                name: dto.name,
                protocolTemplateId: dto.protocolTemplateId,
            },
            include: {
                event: { select: { name: true, status: true } },
                protocolTemplate: { select: { name: true } },
                _count: {
                    select: { referees: true, participations: true },
                },
            },
        })

        return {
            id: updated.id,
            name: updated.name,
            eventId: updated.eventId,
            eventName: updated.event.name,
            eventStatus: updated.event.status,
            protocolTemplateId: updated.protocolTemplateId,
            protocolTemplateName: updated.protocolTemplate.name,
            refereeCount: updated._count.referees,
            participationCount: updated._count.participations,
        }
    }

    async addReferee(categoryId: string, dto: CreateRefereeDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { event: { select: { status: true } } },
        })
        if (!category) {
            throw new NotFoundException('Category not found')
        }
        if (category.event.status !== 'DRAFT') {
            throw new BadRequestException(
                'Arbitrii pot fi asociați doar cât timp competiția este în ciornă.'
            )
        }

        const existing = await this.prisma.categoryReferee.findUnique({
            where: {
                categoryId_letterCode: {
                    categoryId,
                    letterCode: dto.letterCode,
                },
            },
        })
        if (existing) {
            throw new ConflictException(
                'A referee with this letter code already exists for this category.'
            )
        }

        return this.prisma.categoryReferee.create({
            data: { ...dto, categoryId },
        })
    }

    async removeReferee(categoryId: string, refereeId: string): Promise<void> {
        const referee = await this.prisma.categoryReferee.findUnique({
            where: { id: refereeId },
            include: { category: { include: { event: true } } },
        })
        if (!referee || referee.categoryId !== categoryId) {
            throw new NotFoundException('Referee not found')
        }
        if (referee.category.event.status !== 'DRAFT') {
            throw new BadRequestException(
                'Arbitrii pot fi eliminați doar cât timp competiția este în ciornă.'
            )
        }

        await this.prisma.categoryReferee.delete({ where: { id: refereeId } })
    }

    async addParticipation(
        categoryId: string,
        dto: CreateParticipationDto
    ) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { event: { select: { status: true } } },
        })
        if (!category) {
            throw new NotFoundException('Category not found')
        }
        if (
            category.event.status !== 'PUBLISHED' &&
            category.event.status !== 'ONGOING'
        ) {
            throw new BadRequestException(
                'Participanții pot fi înscriși doar cât timp competiția este publicată sau în desfășurare.'
            )
        }

        const athlete = await this.prisma.athlete.findUnique({
            where: { id: dto.athleteId },
        })
        if (!athlete) {
            throw new NotFoundException('Athlete not found')
        }

        return this.prisma.participation.create({
            data: {
                categoryId,
                athleteId: dto.athleteId,
                horseName: dto.horseName,
                participationNumber: dto.participationNumber ?? 1,
            },
        })
    }
}
