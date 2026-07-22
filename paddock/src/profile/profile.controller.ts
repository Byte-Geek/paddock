import { Controller, Get } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get('athlete')
    async getAthleteStats(@CurrentUser('sub') userId: string) {
        return this.profileService.getAthleteStats(userId)
    }

    @Get('coach')
    async getCoachStats(@CurrentUser('sub') userId: string) {
        return this.profileService.getCoachStats(userId)
    }

    @Get('moderator')
    async getModeratorStats() {
        return this.profileService.getModeratorStats()
    }
}
