import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    IsEnum,
} from 'class-validator'
import { ScoringAlgorithm } from '../../generated/prisma/enums'

export class CreateProtocolTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    level?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsInt()
    @IsOptional()
    compositionYear?: number

    @IsInt()
    @IsOptional()
    revisionYear?: number

    @IsInt()
    @IsOptional()
    estimatedTimeSeconds?: number

    @IsEnum(ScoringAlgorithm)
    @IsOptional()
    scoringAlgorithm?: ScoringAlgorithm
}
