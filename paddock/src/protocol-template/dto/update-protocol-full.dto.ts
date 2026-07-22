import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    ValidateNested,
    IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ProtocolElementInputDto } from './protocol-element-input.dto'

export class UpdateProtocolFullDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    level?: string

    @IsInt()
    @IsOptional()
    compositionYear?: number

    @IsInt()
    @IsOptional()
    revisionYear?: number

    @IsInt()
    @IsOptional()
    estimatedTimeSeconds?: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProtocolElementInputDto)
    elements: ProtocolElementInputDto[]
}
