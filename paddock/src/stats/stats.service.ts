import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { MedalsDto } from './dto/medals.dto'
import { EventsTimelinePointDto } from './dto/events-timeline.dto'
import { TopCoachDto } from './dto/top-coach.dto'

const MONTHS_RO = [
    'ian',
    'feb',
    'mar',
    'apr',
    'mai',
    'iun',
    'iul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
]

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) {}

    async getMedals(): Promise<MedalsDto> {
        const [gold, silver, bronze, totalParticipations] = await Promise.all(
            [
                this.prisma.participation.count({ where: { rank: 1 } }),
                this.prisma.participation.count({ where: { rank: 2 } }),
                this.prisma.participation.count({ where: { rank: 3 } }),
                this.prisma.participation.count(),
            ]
        )

        return { gold, silver, bronze, totalParticipations }
    }

    async getEventsTimeline(): Promise<EventsTimelinePointDto[]> {
        const now = new Date()
        const currentYear = now.getFullYear()
        const previousYear = currentYear - 1

        const events = await this.prisma.event.findMany({
            where: {
                startDate: {
                    gte: new Date(previousYear, 0, 1),
                    lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
                },
            },
            select: { startDate: true },
        })

        const counts = new Map<string, number>()
        for (const event of events) {
            if (!event.startDate) continue
            const key = `${event.startDate.getFullYear()}-${event.startDate.getMonth()}`
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }

        return MONTHS_RO.map((month, i) => ({
            month,
            currentYear: counts.get(`${currentYear}-${i}`) ?? 0,
            previousYear: counts.get(`${previousYear}-${i}`) ?? 0,
        }))
    }

    async getTopCoaches(): Promise<TopCoachDto[]> {
        const goldParticipations = await this.prisma.participation.findMany({
            where: { rank: 1 },
            select: {
                athlete: {
                    select: {
                        groups: {
                            where: { leftAt: null },
                            select: {
                                group: {
                                    select: {
                                        coach: {
                                            select: {
                                                id: true,
                                                user: {
                                                    select: {
                                                        firstName: true,
                                                        lastName: true,
                                                        email: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        const medalsByCoach = new Map<string, TopCoachDto>()
        for (const participation of goldParticipations) {
            for (const membership of participation.athlete.groups) {
                const coach = membership.group.coach
                const existing = medalsByCoach.get(coach.id)
                if (existing) {
                    existing.medals += 1
                } else {
                    medalsByCoach.set(coach.id, {
                        id: coach.id,
                        firstName: coach.user.firstName,
                        lastName: coach.user.lastName,
                        email: coach.user.email,
                        medals: 1,
                    })
                }
            }
        }

        return Array.from(medalsByCoach.values())
            .sort((a, b) => b.medals - a.medals)
            .slice(0, 5)
    }

    async getAthletesPerGroup(): Promise<{ name: string; value: number }[]> {
        const groups = await this.prisma.group.findMany({
            select: {
                name: true,
                _count: {
                    select: { athletes: { where: { leftAt: null } } },
                },
            },
        })

        return groups
            .map((g) => ({ name: g.name, value: g._count.athletes }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
    }
}
