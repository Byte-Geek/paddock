import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto'
import { EvaluationDetailDto } from './dto/evaluation-detail.dto'

@Injectable()
export class EvaluationService {
    constructor(private readonly prisma: PrismaService) {}

    async find(
        participationId: string,
        categoryRefereeId: string
    ): Promise<EvaluationDetailDto | null> {
        const evaluation = await this.prisma.evaluation.findUnique({
            where: {
                participationId_categoryRefereeId: {
                    participationId,
                    categoryRefereeId,
                },
            },
            include: { scores: true },
        })
        if (!evaluation) return null

        return {
            id: evaluation.id,
            participationId: evaluation.participationId,
            categoryRefereeId: evaluation.categoryRefereeId,
            finalScore: evaluation.finalScore?.toString() ?? null,
            percentage: evaluation.percentage?.toString() ?? null,
            finalized: evaluation.finalized,
            scores: evaluation.scores.map((s) => ({
                elementId: s.elementId,
                value: s.value?.toString() ?? null,
                correction: s.correction?.toString() ?? null,
                remark: s.remark,
            })),
        }
    }

    async upsert(
        dto: UpsertEvaluationDto,
        enteredByUserId: string
    ): Promise<EvaluationDetailDto> {
        const participation = await this.prisma.participation.findUnique({
            where: { id: dto.participationId },
            include: {
                category: {
                    include: {
                        protocolTemplate: { include: { elements: true } },
                    },
                },
            },
        })
        if (!participation) {
            throw new NotFoundException('Participation not found')
        }

        const referee = await this.prisma.categoryReferee.findUnique({
            where: { id: dto.categoryRefereeId },
        })
        if (!referee || referee.categoryId !== participation.categoryId) {
            throw new NotFoundException(
                'Referee not found for this category'
            )
        }

        const elementsById = new Map(
            participation.category.protocolTemplate.elements.map((el) => [
                el.id,
                el,
            ])
        )

        let finalScore = 0
        let maxPossible = 0
        for (const el of participation.category.protocolTemplate.elements) {
            maxPossible += Number(el.maxScore) * Number(el.coefficient)
        }
        for (const s of dto.scores) {
            const el = elementsById.get(s.elementId)
            if (!el) continue
            const value = s.value ?? 0
            const correction = s.correction ?? 0
            finalScore += (value - correction) * Number(el.coefficient)
        }
        const percentage =
            maxPossible > 0 ? (finalScore / maxPossible) * 100 : 0

        const evaluation = await this.prisma.evaluation.upsert({
            where: {
                participationId_categoryRefereeId: {
                    participationId: dto.participationId,
                    categoryRefereeId: dto.categoryRefereeId,
                },
            },
            create: {
                participationId: dto.participationId,
                categoryRefereeId: dto.categoryRefereeId,
                enteredByUserId,
                finalized: dto.finalized ?? false,
                finalScore,
                percentage,
            },
            update: {
                finalized: dto.finalized ?? false,
                finalScore,
                percentage,
                enteredByUserId,
            },
        })

        await this.prisma.$transaction(
            dto.scores
                .filter((s) => elementsById.has(s.elementId))
                .map((s) =>
                    this.prisma.score.upsert({
                        where: {
                            evaluationId_elementId: {
                                evaluationId: evaluation.id,
                                elementId: s.elementId,
                            },
                        },
                        create: {
                            evaluationId: evaluation.id,
                            elementId: s.elementId,
                            value: s.value,
                            correction: s.correction,
                            remark: s.remark,
                        },
                        update: {
                            value: s.value,
                            correction: s.correction,
                            remark: s.remark,
                        },
                    })
                )
        )

        return this.find(dto.participationId, dto.categoryRefereeId) as Promise<EvaluationDetailDto>
    }
}
