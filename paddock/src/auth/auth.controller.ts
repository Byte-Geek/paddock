import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    NotFoundException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { User } from '../generated/prisma/client.js'

import { LogInDto } from './dto/login.dto'

import { UserService } from '../user/user.service'
import { Public } from './decorators/public.decorator'

interface AuthenticatedRequest {
    user: { email: string; sub: string; role: string }
}

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
        @Req() req: AuthenticatedRequest
    ): Promise<{ email: string; name: string | null; role: string }> {
        const user = await this.UserService.user({ email: req.user.email })
        if (!user) {
            throw new NotFoundException('User not found')
        }
        return { email: user.email, name: user.firstName + ' ' + user.lastName, role: user.role }
    }
}

