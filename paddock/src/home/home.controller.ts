import { Controller, Get } from '@nestjs/common'
import { HomeService } from './home.service'
import { Public } from '../auth/decorators/public.decorator'

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    @Public()
    @Get('summary')
    async getSummary() {
        return this.homeService.getSummary()
    }

    @Public()
    @Get('upcoming-events')
    async getUpcomingEvents() {
        return this.homeService.getUpcomingEvents()
    }
}
