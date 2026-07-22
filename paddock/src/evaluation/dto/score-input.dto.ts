import { IsNumber, IsOptional, IsString } from 'class-validator'

export class ScoreInputDto {
    @IsString()
    elementId: string

    @IsNumber()
    @IsOptional()
    value?: number

    @IsNumber()
    @IsOptional()
    correction?: number

    @IsString()
    @IsOptional()
    remark?: string
}
