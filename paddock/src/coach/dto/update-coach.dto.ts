import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateCoachDto {
    @IsEmail()
    @IsOptional()
    email?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstName?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastName?: string
}
