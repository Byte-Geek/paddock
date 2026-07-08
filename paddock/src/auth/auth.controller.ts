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
import { CreateUserDto } from './dto/create-user.dto'
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
    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto
    ): Promise<{ message: string; user: CreateUserDto }> {
        return await this.authService.register(createUserDto)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() logInDto: LogInDto) : Promise<LogInDto> {
        return await this.authService.signIn(logInDto.email, logInDto.password)
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(
        @Req() req: any
    ): Promise<{ email: string; name: string | null }> {
        const user = await this.UserService.user({ email: req.user.email })
        if (!user) {
            throw new Error('User not found')
        }
        // return user
        return { email: user.email, name: user.name }
    }
}
