import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('summary')
    async getSummary() {
        const athletes = await this.prisma.user.count({
            where: { role: 'USER' },
        })

        const coaches = await this.prisma.user.count({
            where: { role: 'MODERATOR' },
        })

        const totalUsers = await this.prisma.user.count()

        return {
            athletes,
            coaches,
            totalUsers,
        }
    }
}
