import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { HomeSummaryDto } from './dto/home-summary.dto'
import { UpcomingEventDto } from './dto/upcoming-event.dto'

@Injectable()
export class HomeService {
    constructor(private readonly prisma: PrismaService) {}

    async getSummary(): Promise<HomeSummaryDto> {
        const now = new Date()
        const oneMonthAgo = new Date(now)
        oneMonthAgo.setMonth(now.getMonth() - 1)

        const startOfCurrentYear = new Date(now.getFullYear(), 0, 1)
        const endOfCurrentYear = new Date(
            now.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
        )

        const [
            athletes,
            coaches,
            groups,
            championshipsThisYear,
            athletesModified,
            coachesModified,
            groupsModified,
        ] = await Promise.all([
            this.prisma.user.count({
                where: { role: 'ATHLETE' },
            }),
            this.prisma.user.count({
                where: { role: 'COACH' },
            }),
            this.prisma.group.count(),
            this.prisma.event.count({
                where: {
                    status: 'COMPLETED',
                },
            }),
            this.prisma.user.count({
                where: {
                    role: 'ATHLETE',
                    updatedAt: {
                        gte: oneMonthAgo,
                    },
                },
            }),
            this.prisma.user.count({
                where: {
                    role: 'COACH',
                    updatedAt: {
                        gte: oneMonthAgo,
                    },
                },
            }),
            this.prisma.group.count({
                where: {
                    updatedAt: {
                        gte: oneMonthAgo,
                    },
                },
            }),
        ])

        return {
            athletes,
            coaches,
            groups,
            championshipsThisYear,
            modificationsLastMonth: {
                athletes: athletesModified,
                coaches: coachesModified,
                groups: groupsModified,
            },
        }
    }

    async getUpcomingEvents(): Promise<UpcomingEventDto[]> {
        const now = new Date()
        const events = await this.prisma.event.findMany({
            where: {
                startDate: { gte: now },
                status: { in: ['PUBLISHED', 'ONGOING'] },
            },
            orderBy: { startDate: 'asc' },
            take: 5,
            select: {
                id: true,
                name: true,
                location: true,
                startDate: true,
            },
        })

        return events
            .filter((e) => e.startDate !== null)
            .map((e) => ({
                id: e.id,
                title: e.name,
                location: e.location,
                startDate: e.startDate as Date,
            }))
    }
}
