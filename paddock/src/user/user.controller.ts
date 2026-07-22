import {
    Body,
    ConflictException,
    Controller,
    Get,
    Patch,
    Query,
    Req,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '../generated/prisma/enums'

interface AuthenticatedRequest {
    user: { email: string; sub: string; role: string }
}

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Roles('ADMIN')
    @Get()
    async list(@Query('role') role?: string) {
        const users = await this.userService.users({
            where: role ? { role: role as Role } : undefined,
            orderBy: { firstName: 'asc' },
        })
        return users.map(({ password: _password, ...safeUser }) => safeUser)
    }

    @Get('me')
    async getMe(@Req() req: AuthenticatedRequest) {
        const user = await this.userService.user({ id: req.user.sub })
        if (!user) return null
        const { password: _password, ...safeUser } = user
        return safeUser
    }

    @Patch('me')
    async updateMe(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateProfileDto
    ) {
        if (dto.email) {
            const existing = await this.userService.user({
                email: dto.email,
            })
            if (existing && existing.id !== req.user.sub) {
                throw new ConflictException('Email already in use')
            }
        }

        const updated = await this.userService.updateUser(req.user.sub, {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
        })
        const { password: _password, ...safeUser } = updated
        return safeUser
    }
}
