import { Controller, Get, Req } from '@nestjs/common'
import { ProfileService } from './profile.service'

interface AuthenticatedRequest {
    user: { email: string; sub: string; role: string }
}

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get('athlete')
    async getAthleteStats(@Req() req: AuthenticatedRequest) {
        return this.profileService.getAthleteStats(req.user.sub)
    }

    @Get('coach')
    async getCoachStats(@Req() req: AuthenticatedRequest) {
        return this.profileService.getCoachStats(req.user.sub)
    }

    @Get('moderator')
    async getModeratorStats() {
        return this.profileService.getModeratorStats()
    }
}
