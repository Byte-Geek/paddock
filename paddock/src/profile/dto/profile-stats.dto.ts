export class PersonalMedalsDto {
    gold: number
    silver: number
    bronze: number
    total: number
}

export class ParticipationHistoryEntryDto {
    id: string
    eventName: string
    categoryName: string
    eventDate: Date | null
    horseName: string | null
    finalScore: string | null
    rank: number | null
    status: string
}

export class AthleteRankDto {
    position: number
    totalAthletes: number
}

export class NextEventDto {
    eventName: string
    categoryName: string
    location: string | null
    startDate: Date
}

export class DisciplineProgressDto {
    discipline: 'DRESSAGE' | 'SHOW_JUMPING'
    avgPercentage: number | null
    count: number
}

export class AthleteProfileStatsDto {
    medals: PersonalMedalsDto
    history: ParticipationHistoryEntryDto[]
    rank: AthleteRankDto | null
    nextEvent: NextEventDto | null
    disciplineProgress: DisciplineProgressDto[]
}

export class CoachGroupStatsDto {
    id: string
    name: string
    athleteCount: number
    medals: PersonalMedalsDto
}

export class AthleteAttentionDto {
    id: string
    name: string
    groupName: string
    reason: 'NO_RECENT_RESULTS' | 'INCOMPLETE_PROTOCOL'
}

export class CoachUpcomingEventDto {
    id: string
    eventName: string
    startDate: Date | null
    location: string | null
    athleteCount: number
}

export class CoachProfileStatsDto {
    ownParticipation: AthleteProfileStatsDto | null
    groups: CoachGroupStatsDto[]
    overall: {
        totalAthletes: number
        totalParticipations: number
        medals: PersonalMedalsDto
    }
    athletesNeedingAttention: AthleteAttentionDto[]
    upcomingEvents: CoachUpcomingEventDto[]
}

export class RecentActivityItemDto {
    type: 'ATHLETE' | 'COACH' | 'EVENT'
    label: string
    createdAt: Date
}

export class PendingItemDto {
    type: 'DRAFT_EVENT' | 'UNFINISHED_EVALUATION'
    label: string
}

export class ModeratorProfileStatsDto {
    athletes: number
    coaches: number
    groups: number
    events: number
    note: string
    recentActivity: RecentActivityItemDto[]
    pending: {
        draftEvents: number
        unfinishedEvaluations: number
        items: PendingItemDto[]
    }
}
