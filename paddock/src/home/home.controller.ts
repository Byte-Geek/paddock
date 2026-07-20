import { Controller, Get } from '@nestjs/common'
import { HomeService } from './home.service'

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    @Get('summary')
    async getSummary() {
        return this.homeService.getSummary()
    }

    @Get('upcoming-events')
    async getUpcomingEvents() {
        return this.homeService.getUpcomingEvents()
    }
}
