import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator'

export class CreateParticipationDto {
    @IsString()
    @IsNotEmpty()
    athleteId: string

    @IsString()
    @IsOptional()
    horseName?: string

    @IsInt()
    @IsOptional()
    participationNumber?: number
}
