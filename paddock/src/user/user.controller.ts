import {
    Body,
    ConflictException,
    Controller,
    Get,
    Patch,
    Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '../generated/prisma/enums'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

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
    async getMe(@CurrentUser('sub') userId: string) {
        const user = await this.userService.user({ id: userId })
        if (!user) return null
        const { password: _password, ...safeUser } = user
        return safeUser
    }

    @Patch('me')
    async updateMe(
        @CurrentUser('sub') userId: string,
        @Body() dto: UpdateProfileDto
    ) {
        if (dto.email) {
            const existing = await this.userService.user({
                email: dto.email,
            })
            if (existing && existing.id !== userId) {
                throw new ConflictException('Email already in use')
            }
        }

        const updated = await this.userService.updateUser(userId, {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
        })
        const { password: _password, ...safeUser } = updated
        return safeUser
    }
}
