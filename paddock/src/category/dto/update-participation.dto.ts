import { IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateParticipationDto {
    @IsString()
    @IsOptional()
    horseName?: string

    @IsInt()
    @IsOptional()
    startOrder?: number

    @IsString()
    @IsOptional()
    startTime?: string
}
