import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto'
import { UpdateProtocolFullDto } from './dto/update-protocol-full.dto'
import {
    ProtocolTemplateDto,
    ProtocolTemplateDetailDto,
} from './dto/protocol-template.dto'

@Injectable()
export class ProtocolTemplateService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ProtocolTemplateDto[]> {
        const templates = await this.prisma.protocolTemplate.findMany({
            include: {
                _count: { select: { elements: true, categories: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return templates.map((t) => ({
            id: t.id,
            name: t.name,
            level: t.level,
            description: t.description,
            compositionYear: t.compositionYear,
            revisionYear: t.revisionYear,
            estimatedTimeSeconds: t.estimatedTimeSeconds,
            scoringAlgorithm: t.scoringAlgorithm,
            active: t._count.categories > 0,
            elementCount: t._count.elements,
            categoryCount: t._count.categories,
            pdfUrl: t.pdfUrl,
            pdfFileName: t.pdfFileName,
        }))
    }

    async findOne(id: string): Promise<ProtocolTemplateDetailDto> {
        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id },
            include: {
                elements: { orderBy: { order: 'asc' } },
                _count: { select: { elements: true, categories: true } },
            },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }

        return {
            id: template.id,
            name: template.name,
            level: template.level,
            description: template.description,
            compositionYear: template.compositionYear,
            revisionYear: template.revisionYear,
            estimatedTimeSeconds: template.estimatedTimeSeconds,
            scoringAlgorithm: template.scoringAlgorithm,
            active: template._count.categories > 0,
            elementCount: template._count.elements,
            categoryCount: template._count.categories,
            pdfUrl: template.pdfUrl,
            pdfFileName: template.pdfFileName,
            elements: template.elements.map((el) => ({
                id: el.id,
                order: el.order,
                number: el.number,
                letters: el.letters,
                name: el.name,
                judgingCriteria: el.judgingCriteria,
                maxScore: el.maxScore.toString(),
                coefficient: el.coefficient.toString(),
            })),
        }
    }

    async updateFull(
        id: string,
        dto: UpdateProtocolFullDto
    ): Promise<ProtocolTemplateDetailDto> {
        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id },
            include: {
                elements: {
                    include: { _count: { select: { scores: true } } },
                },
                _count: { select: { categories: true } },
            },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }
        if (template._count.categories > 0) {
            throw new BadRequestException(
                'Protocolul este activ (folosit deja de o competiție) și nu mai poate fi editat.'
            )
        }

        const existingById = new Map(
            template.elements.map((el) => [el.id, el])
        )
        const incomingIds = new Set(
            dto.elements.filter((el) => el.id).map((el) => el.id as string)
        )

        const removedWithScores = template.elements.filter(
            (el) => !incomingIds.has(el.id) && el._count.scores > 0
        )
        if (removedWithScores.length > 0) {
            throw new BadRequestException(
                `Nu poți elimina elementul "${removedWithScores[0].name}" — are deja rezultate înregistrate la o competiție.`
            )
        }

        const toDeleteIds = template.elements
            .filter((el) => !incomingIds.has(el.id))
            .map((el) => el.id)

        const operations = [
            this.prisma.protocolTemplate.update({
                where: { id },
                data: {
                    name: dto.name,
                    level: dto.level,
                    compositionYear: dto.compositionYear,
                    revisionYear: dto.revisionYear,
                    estimatedTimeSeconds: dto.estimatedTimeSeconds,
                },
            }),
            ...(toDeleteIds.length > 0
                ? [
                      this.prisma.protocolElement.deleteMany({
                          where: { id: { in: toDeleteIds } },
                      }),
                  ]
                : []),
            ...dto.elements.map((el, index) => {
                const data = {
                    order: index + 1,
                    number: el.number ?? index + 1,
                    letters: el.letters,
                    name: el.name || `Element ${index + 1}`,
                    judgingCriteria: el.judgingCriteria,
                    maxScore: el.maxScore ?? 10,
                    coefficient: el.coefficient ?? 1,
                }
                if (el.id && existingById.has(el.id)) {
                    return this.prisma.protocolElement.update({
                        where: { id: el.id },
                        data,
                    })
                }
                return this.prisma.protocolElement.create({
                    data: { ...data, templateId: id },
                })
            }),
        ]

        await this.prisma.$transaction(operations)

        return this.findOne(id)
    }

    async create(
        dto: CreateProtocolTemplateDto
    ): Promise<ProtocolTemplateDto> {
        const template = await this.prisma.protocolTemplate.create({
            data: {
                name: dto.name,
                level: dto.level,
                description: dto.description,
                compositionYear: dto.compositionYear,
                revisionYear: dto.revisionYear,
                estimatedTimeSeconds: dto.estimatedTimeSeconds,
            },
        })

        return {
            id: template.id,
            name: template.name,
            level: template.level,
            description: template.description,
            compositionYear: template.compositionYear,
            revisionYear: template.revisionYear,
            estimatedTimeSeconds: template.estimatedTimeSeconds,
            scoringAlgorithm: template.scoringAlgorithm,
            active: false,
            elementCount: 0,
            categoryCount: 0,
            pdfUrl: template.pdfUrl,
            pdfFileName: template.pdfFileName,
        }
    }

    async setPdf(
        id: string,
        data: { pdfUrl: string; pdfFileName: string }
    ): Promise<ProtocolTemplateDto> {
        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id },
            include: { _count: { select: { elements: true, categories: true } } },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }

        const updated = await this.prisma.protocolTemplate.update({
            where: { id },
            data: { pdfUrl: data.pdfUrl, pdfFileName: data.pdfFileName },
            include: { _count: { select: { elements: true, categories: true } } },
        })

        return {
            id: updated.id,
            name: updated.name,
            level: updated.level,
            description: updated.description,
            compositionYear: updated.compositionYear,
            revisionYear: updated.revisionYear,
            estimatedTimeSeconds: updated.estimatedTimeSeconds,
            scoringAlgorithm: updated.scoringAlgorithm,
            active: updated._count.categories > 0,
            elementCount: updated._count.elements,
            categoryCount: updated._count.categories,
            pdfUrl: updated.pdfUrl,
            pdfFileName: updated.pdfFileName,
        }
    }

    async remove(id: string): Promise<void> {
        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id },
            include: { _count: { select: { categories: true } } },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }
        if (template._count.categories > 0) {
            throw new BadRequestException(
                'Protocolul este activ (folosit deja de o competiție) și nu poate fi șters.'
            )
        }

        await this.prisma.protocolTemplate.delete({ where: { id } })
    }
}
