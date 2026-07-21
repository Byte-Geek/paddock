import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class CreateCoachDto {
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
}
