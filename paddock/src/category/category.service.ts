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
import { UpdateParticipationDto } from './dto/update-participation.dto'
import { CategoryDto, CategoryDetailDto } from './dto/category.dto'
import { formatFullName } from '../common/utils/name.util'
import { assertStatus } from '../common/utils/assert-status.util'

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
                    include: {
                        athlete: { include: { user: true } },
                        evaluations: {
                            where: { finalized: true },
                            select: {
                                categoryRefereeId: true,
                                finalScore: true,
                                percentage: true,
                            },
                        },
                    },
                    orderBy: [
                        { startOrder: 'asc' },
                        { participationNumber: 'asc' },
                    ],
                },
            },
        })
        if (
            !category ||
            (category.event.status === 'DRAFT' && requesterRole !== 'ADMIN')
        ) {
            throw new NotFoundException('Category not found')
        }

        const livePercentageByParticipation = new Map<string, number>()
        const accumulatedScoreByParticipation = new Map<string, number>()
        for (const p of category.participations) {
            if (p.evaluations.length === 0) continue
            const avg =
                p.evaluations.reduce(
                    (sum, e) => sum + Number(e.percentage ?? 0),
                    0
                ) / p.evaluations.length
            livePercentageByParticipation.set(p.id, avg)
            const total = p.evaluations.reduce(
                (sum, e) => sum + Number(e.finalScore ?? 0),
                0
            )
            accumulatedScoreByParticipation.set(p.id, total)
        }
        const liveRankByParticipation = new Map<string, number>()
        let previousPercentage: number | null = null
        let currentRank = 0
        Array.from(livePercentageByParticipation.entries())
            .sort((a, b) => b[1] - a[1])
            .forEach(([participationId, percentage]) => {
                if (previousPercentage === null || percentage !== previousPercentage) {
                    currentRank += 1
                }
                liveRankByParticipation.set(participationId, currentRank)
                previousPercentage = percentage
            })

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
                athleteName: formatFullName(
                    p.athlete.user.firstName,
                    p.athlete.user.lastName,
                    p.athlete.user.email
                ),
                horseName: p.horseName,
                startOrder: p.startOrder,
                startTime: p.startTime,
                participationNumber: p.participationNumber,
                finalScore: p.finalScore?.toString() ?? null,
                rank: p.rank,
                status: p.status,
                livePercentage:
                    livePercentageByParticipation.get(p.id) ?? null,
                liveRank: liveRankByParticipation.get(p.id) ?? null,
                accumulatedScore:
                    accumulatedScoreByParticipation.get(p.id) ?? null,
                refereeScores: p.evaluations.map((e) => ({
                    refereeId: e.categoryRefereeId,
                    finalScore: e.finalScore?.toString() ?? null,
                    percentage: e.percentage?.toString() ?? null,
                })),
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
        assertStatus(
            event.status,
            'DRAFT',
            'Categoriile pot fi create doar cât timp competiția este în ciornă.'
        )

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
        assertStatus(
            category.event.status,
            'DRAFT',
            'Categoria poate fi editată doar cât timp competiția este în ciornă.'
        )

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
        if (!['DRAFT', 'PUBLISHED'].includes(category.event.status)) {
            throw new BadRequestException(
                'Arbitrii pot fi asociați doar cât timp competiția este în ciornă sau publicată.'
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
        if (!['DRAFT', 'PUBLISHED'].includes(referee.category.event.status)) {
            throw new BadRequestException(
                'Arbitrii pot fi eliminați doar cât timp competiția este în ciornă sau publicată.'
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

        let participationNumber = dto.participationNumber
        if (participationNumber === undefined) {
            const existing = await this.prisma.participation.findMany({
                where: { categoryId, athleteId: dto.athleteId },
                select: { participationNumber: true },
                orderBy: { participationNumber: 'desc' },
                take: 1,
            })
            participationNumber = (existing[0]?.participationNumber ?? 0) + 1
        }

        const maxStartOrder = await this.prisma.participation.aggregate({
            where: { categoryId },
            _max: { startOrder: true },
        })
        const startOrder = (maxStartOrder._max.startOrder ?? 0) + 1

        return this.prisma.participation.create({
            data: {
                categoryId,
                athleteId: dto.athleteId,
                horseName: dto.horseName,
                participationNumber,
                startOrder,
            },
        })
    }

    async updateParticipation(
        categoryId: string,
        participationId: string,
        dto: UpdateParticipationDto
    ) {
        const participation = await this.prisma.participation.findUnique({
            where: { id: participationId },
            include: { category: { include: { event: true } } },
        })
        if (!participation || participation.categoryId !== categoryId) {
            throw new NotFoundException('Participation not found')
        }
        if (
            participation.category.event.status !== 'PUBLISHED' &&
            participation.category.event.status !== 'ONGOING'
        ) {
            throw new BadRequestException(
                'Participanții pot fi modificați doar cât timp competiția este publicată sau în desfășurare.'
            )
        }

        return this.prisma.participation.update({
            where: { id: participationId },
            data: {
                horseName: dto.horseName,
                startOrder: dto.startOrder,
                startTime: dto.startTime,
            },
        })
    }
}
