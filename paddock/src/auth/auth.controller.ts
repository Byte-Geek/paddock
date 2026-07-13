import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { User } from '../generated/prisma/client.js'

import { LogInDto } from './dto/login.dto'

import { UserService } from '../user/user.service'
import { Public } from './decorators/public.decorator'

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
    @Get('profile')
    async getProfile(
        @Req() req: any
    ): Promise<{ email: string; name: string | null; role: string }> {
        const user = await this.UserService.user({ email: req.user.email })
        if (!user) {
            throw new Error('User not found')
        }
        return { email: user.email, name: user.name, role: user.role }
    }
}

