import {
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ScoreInputDto } from './score-input.dto'

export class UpsertEvaluationDto {
    @IsString()
    participationId: string

    @IsString()
    categoryRefereeId: string

    @IsBoolean()
    @IsOptional()
    finalized?: boolean

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScoreInputDto)
    scores: ScoreInputDto[]
}
