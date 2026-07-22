export class ScoreDetailDto {
    elementId: string
    value: string | null
    correction: string | null
    remark: string | null
}

export class EvaluationDetailDto {
    id: string
    participationId: string
    categoryRefereeId: string
    finalScore: string | null
    percentage: string | null
    finalized: boolean
    scores: ScoreDetailDto[]
}
