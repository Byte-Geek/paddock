import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateRefereeDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsString()
    @IsNotEmpty()
    letterCode: string

    @IsString()
    @IsOptional()
    position?: string
}
