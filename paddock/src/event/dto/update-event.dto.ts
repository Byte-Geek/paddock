import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsEnum,
} from 'class-validator'
import { EventStatus } from '../../generated/prisma/enums'

export class UpdateEventDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string

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
}
