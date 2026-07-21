import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
    AthleteProfileStatsDto,
    CoachProfileStatsDto,
    ModeratorProfileStatsDto,
    ParticipationHistoryEntryDto,
    PersonalMedalsDto,
} from './dto/profile-stats.dto'

type ParticipationWithCategory = {
    id: string
    horseName: string | null
    finalScore: { toString(): string } | null
    rank: number | null
    status: string
    category: {
        name: string
        event: { name: string; startDate: Date | null }
    }
}

function toMedals(
    participations: { rank: number | null }[]
): PersonalMedalsDto {
    return {
        gold: participations.filter((p) => p.rank === 1).length,
        silver: participations.filter((p) => p.rank === 2).length,
        bronze: participations.filter((p) => p.rank === 3).length,
        total: participations.length,
    }
}

function toHistory(
    participations: ParticipationWithCategory[]
): ParticipationHistoryEntryDto[] {
    return participations
        .map((p) => ({
            id: p.id,
            eventName: p.category.event.name,
            categoryName: p.category.name,
            eventDate: p.category.event.startDate,
            horseName: p.horseName,
            finalScore: p.finalScore?.toString() ?? null,
            rank: p.rank,
            status: p.status,
        }))
        .sort((a, b) => {
            const aTime = a.eventDate ? new Date(a.eventDate).getTime() : 0
            const bTime = b.eventDate ? new Date(b.eventDate).getTime() : 0
            return bTime - aTime
        })
}

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}

    async getAthleteStats(userId: string): Promise<AthleteProfileStatsDto> {
        const athlete = await this.prisma.athlete.findUnique({
            where: { userId },
            include: {
                participations: {
                    include: {
                        category: { include: { event: true } },
                    },
                },
            },
        })
        if (!athlete) {
            throw new NotFoundException('Athlete profile not found')
        }

        return {
            medals: toMedals(athlete.participations),
            history: toHistory(athlete.participations),
        }
    }

    async getCoachStats(userId: string): Promise<CoachProfileStatsDto> {
        const coach = await this.prisma.coach.findUnique({
            where: { userId },
            include: {
                groups: {
                    include: {
                        athletes: {
                            where: { leftAt: null },
                            include: {
                                athlete: {
                                    include: { participations: true },
                                },
                            },
                        },
                    },
                },
            },
        })
        if (!coach) {
            throw new NotFoundException('Coach profile not found')
        }

        const athlete = await this.prisma.athlete.findUnique({
            where: { userId },
            include: {
                participations: {
                    include: {
                        category: { include: { event: true } },
                    },
                },
            },
        })

        const groups = coach.groups.map((group) => {
            const groupParticipations = group.athletes.flatMap(
                (membership) => membership.athlete.participations
            )
            return {
                id: group.id,
                name: group.name,
                athleteCount: group.athletes.length,
                medals: toMedals(groupParticipations),
            }
        })

        const allParticipations = coach.groups.flatMap((group) =>
            group.athletes.flatMap((m) => m.athlete.participations)
        )
        const totalAthletes = new Set(
            coach.groups.flatMap((group) =>
                group.athletes.map((m) => m.athlete.id)
            )
        ).size

        return {
            ownParticipation: athlete
                ? {
                      medals: toMedals(athlete.participations),
                      history: toHistory(athlete.participations),
                  }
                : null,
            groups,
            overall: {
                totalAthletes,
                totalParticipations: allParticipations.length,
                medals: toMedals(allParticipations),
            },
        }
    }

    async getModeratorStats(): Promise<ModeratorProfileStatsDto> {
        const [athletes, coaches, groups, events] = await Promise.all([
            this.prisma.user.count({ where: { role: 'ATHLETE' } }),
            this.prisma.user.count({ where: { role: 'COACH' } }),
            this.prisma.group.count(),
            this.prisma.event.count(),
        ])

        return {
            athletes,
            coaches,
            groups,
            events,
            note: 'Panou temporar — secțiunea dedicată moderatorilor va fi definită ulterior.',
        }
    }
}
