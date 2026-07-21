import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto'
import { UpdateProtocolTemplateDto } from './dto/update-protocol-template.dto'
import { ProtocolTemplateDto } from './dto/protocol-template.dto'

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
            active: t.active,
            elementCount: t._count.elements,
            categoryCount: t._count.categories,
        }))
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
                scoringAlgorithm: dto.scoringAlgorithm,
                active: dto.active,
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
            active: template.active,
            elementCount: 0,
            categoryCount: 0,
        }
    }

    async update(
        id: string,
        dto: UpdateProtocolTemplateDto
    ): Promise<ProtocolTemplateDto> {
        const template = await this.prisma.protocolTemplate.findUnique({
            where: { id },
        })
        if (!template) {
            throw new NotFoundException('Protocol template not found')
        }

        const updated = await this.prisma.protocolTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                level: dto.level,
                description: dto.description,
                compositionYear: dto.compositionYear,
                revisionYear: dto.revisionYear,
                estimatedTimeSeconds: dto.estimatedTimeSeconds,
                scoringAlgorithm: dto.scoringAlgorithm,
                active: dto.active,
            },
            include: {
                _count: { select: { elements: true, categories: true } },
            },
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
            active: updated.active,
            elementCount: updated._count.elements,
            categoryCount: updated._count.categories,
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
                'Cannot delete a protocol template already used by competition categories.'
            )
        }

        await this.prisma.protocolTemplate.delete({ where: { id } })
    }
}
