import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsEnum,
    IsArray,
} from 'class-validator'
import { EventStatus } from '../../generated/prisma/enums'

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    location?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsDateString()
    @IsOptional()
    startDate?: string

    @IsDateString()
    @IsOptional()
    endDate?: string

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    secretaryIds?: string[]
}
