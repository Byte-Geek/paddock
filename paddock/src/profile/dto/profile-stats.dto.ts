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

export class AthleteProfileStatsDto {
    medals: PersonalMedalsDto
    history: ParticipationHistoryEntryDto[]
}

export class CoachGroupStatsDto {
    id: string
    name: string
    athleteCount: number
    medals: PersonalMedalsDto
}

export class CoachProfileStatsDto {
    ownParticipation: AthleteProfileStatsDto | null
    groups: CoachGroupStatsDto[]
    overall: {
        totalAthletes: number
        totalParticipations: number
        medals: PersonalMedalsDto
    }
}

export class ModeratorProfileStatsDto {
    athletes: number
    coaches: number
    groups: number
    events: number
    note: string
}
