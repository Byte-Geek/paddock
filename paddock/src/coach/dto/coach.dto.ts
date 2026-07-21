export class CoachDto {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    groups: { id: string; name: string }[]
}
