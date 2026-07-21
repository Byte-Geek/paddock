import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateGroupDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    coachId?: string
}
