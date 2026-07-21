export class EventDto {
    id: string
    name: string
    location: string | null
    description: string | null
    startDate: Date | null
    endDate: Date | null
    status: string
    participantCount: number
}

export class ParticipationEntryDto {
    id: string
    athleteId: string
    athleteName: string
    horseName: string | null
    finalScore: string | null
    rank: number | null
    status: string
}

export class CategoryEntryDto {
    id: string
    name: string
    participations: ParticipationEntryDto[]
}

export class EventDetailDto extends EventDto {
    categories: CategoryEntryDto[]
}
