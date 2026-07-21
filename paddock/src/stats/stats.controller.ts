import { Controller, Get } from '@nestjs/common'
import { StatsService } from './stats.service'

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('medals')
    async getMedals() {
        return this.statsService.getMedals()
    }

    @Get('events-timeline')
    async getEventsTimeline() {
        return this.statsService.getEventsTimeline()
    }

    @Get('top-coaches')
    async getTopCoaches() {
        return this.statsService.getTopCoaches()
    }

    @Get('athletes-per-group')
    async getAthletesPerGroup() {
        return this.statsService.getAthletesPerGroup()
    }
}
