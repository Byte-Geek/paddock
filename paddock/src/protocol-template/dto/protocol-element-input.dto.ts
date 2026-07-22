import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

export class ProtocolElementInputDto {
    @IsString()
    @IsOptional()
    id?: string

    @IsString()
    @IsOptional()
    letters?: string

    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    judgingCriteria?: string

    @IsNumber()
    @IsOptional()
    maxScore?: number

    @IsIn([1, 2])
    @IsOptional()
    coefficient?: number

    @IsInt()
    @IsOptional()
    number?: number
}
