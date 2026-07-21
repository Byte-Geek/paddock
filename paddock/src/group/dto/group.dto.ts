export class GroupCoachDto {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
}

export class GroupDto {
    id: string
    name: string
    description: string | null
    coach: GroupCoachDto
    athleteCount: number
}

export class GroupMemberDto {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
}

export class GroupDetailDto extends GroupDto {
    members: GroupMemberDto[]
}
