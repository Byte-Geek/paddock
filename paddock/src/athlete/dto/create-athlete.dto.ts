import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator'

export class CreateAthleteDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsString()
    @IsOptional()
    groupId?: string
}
