export class RefereeDto {
    id: string
    firstName: string
    lastName: string
    letterCode: string
    position: string | null
}

export class RefereeScoreDto {
    refereeId: string
    finalScore: string | null
    percentage: string | null
}

export class ParticipationDto {
    id: string
    athleteId: string
    athleteName: string
    horseName: string | null
    startOrder: number | null
    startTime: string | null
    participationNumber: number
    finalScore: string | null
    rank: number | null
    status: string
    livePercentage: number | null
    liveRank: number | null
    accumulatedScore: number | null
    refereeScores: RefereeScoreDto[]
}

export class CategoryElementDto {
    id: string
    order: number
    number: number | null
    letters: string | null
    name: string
    judgingCriteria: string | null
    maxScore: string
    coefficient: string
}

export class CategoryDto {
    id: string
    name: string
    eventId: string
    eventName: string
    eventStatus: string
    protocolTemplateId: string
    protocolTemplateName: string
    refereeCount: number
    participationCount: number
}

export class CategoryDetailDto extends CategoryDto {
    elements: CategoryElementDto[]
    referees: RefereeDto[]
    participations: ParticipationDto[]
}
