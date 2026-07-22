import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    NotFoundException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { User } from '../generated/prisma/client.js'

import { LogInDto } from './dto/login.dto'

import { UserService } from '../user/user.service'
import { Public } from './decorators/public.decorator'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly UserService: UserService
    ) {}



    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() logInDto: LogInDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
        return await this.authService.signIn(logInDto.email, logInDto.password)
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @CurrentUser('email') email: string
    ): Promise<{ access_token: string }> {
        return this.authService.refresh(email)
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(
        @CurrentUser('email') email: string
    ): Promise<{ email: string; name: string | null; role: string }> {
        const user = await this.UserService.user({ email })
        if (!user) {
            throw new NotFoundException('User not found')
        }
        return { email: user.email, name: user.firstName + ' ' + user.lastName, role: user.role }
    }
}

