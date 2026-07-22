import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    protocolTemplateId?: string
}
