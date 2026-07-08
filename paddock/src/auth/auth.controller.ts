import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/create-user.dto'

import { UserService } from '../user/user.service'
import { User as UserModel } from '../generated/prisma/client'

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly UserService: UserService
    ) {}

    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto
    ): Promise<{ message: string; user: CreateUserDto }> {
        return await this.authService.register(createUserDto)
    }

    @Get('')
    async getAllUser(): Promise<UserModel[]> {
        return this.UserService.users({})
    }
}
