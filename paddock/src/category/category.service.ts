import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateRefereeDto } from './dto/create-referee.dto'
import { CreateParticipationDto } from './dto/create-participation.dto'
import { CategoryDto, CategoryDetailDto } from './dto/category.dto'

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllForEvent(eventId: string): Promise<CategoryDto[]> {
        const categories = await this.prisma.category.findMany({
            where: { eventId },
            include: {
                event: { select: { name: true } },
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
            protocolTemplateId: c.protocolTemplateId,
            protocolTemplateName: c.protocolTemplate.name,
            refereeCount: c._count.referees,
            participationCount: c._count.participations,
        }))
    }

    async findOne(id: string): Promise<CategoryDetailDto> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                event: { select: { name: true } },
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
        if (!category) {
            throw new NotFoundException('Category not found')
        }

        return {
            id: category.id,
            name: category.name,
            eventId: category.eventId,
            eventName: category.event.name,
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
                event: { select: { name: true } },
                protocolTemplate: { select: { name: true } },
            },
        })

        return {
            id: category.id,
            name: category.name,
            eventId: category.eventId,
            eventName: category.event.name,
            protocolTemplateId: category.protocolTemplateId,
            protocolTemplateName: category.protocolTemplate.name,
            refereeCount: 0,
            participationCount: 0,
        }
    }

    async addReferee(categoryId: string, dto: CreateRefereeDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        })
        if (!category) {
            throw new NotFoundException('Category not found')
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

    async addParticipation(
        categoryId: string,
        dto: CreateParticipationDto
    ) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        })
        if (!category) {
            throw new NotFoundException('Category not found')
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
