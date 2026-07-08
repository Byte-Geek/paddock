import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator'

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, {
        message: 'name must be at least 3 characters long',
    })
    name: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'password must be at least 8 characters long',
    })
    password: string
}
