import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { userNameSelect } from '../common/prisma-selects/user-name.select'
import {
    AthleteAttentionDto,
    AthleteProfileStatsDto,
    AthleteRankDto,
    CoachProfileStatsDto,
    CoachUpcomingEventDto,
    DisciplineProgressDto,
    ModeratorProfileStatsDto,
    NextEventDto,
    ParticipationHistoryEntryDto,
    PendingItemDto,
    PersonalMedalsDto,
    RecentActivityItemDto,
} from './dto/profile-stats.dto'

const ATTENTION_WINDOW_DAYS = 90
const ACTIVE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING']

type ParticipationWithCategory = {
    id: string
    horseName: string | null
    finalScore: { toString(): string } | null
    percentage: { toString(): string } | null
    rank: number | null
    status: string
    category: {
        name: string
        discipline: string | null
        event: {
            name: string
            startDate: Date | null
            location: string | null
            status: string
        }
    }
}

function formatName(user: {
    firstName: string | null
    lastName: string | null
    email: string
}): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    return name || user.email
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

function toNextEvent(
    participations: ParticipationWithCategory[]
): NextEventDto | null {
    const now = Date.now()
    const upcoming = participations
        .filter(
            (p) =>
                p.status === 'REGISTERED' &&
                p.category.event.startDate &&
                new Date(p.category.event.startDate).getTime() >= now &&
                ACTIVE_EVENT_STATUSES.includes(p.category.event.status)
        )
        .sort(
            (a, b) =>
                new Date(a.category.event.startDate!).getTime() -
                new Date(b.category.event.startDate!).getTime()
        )

    const next = upcoming[0]
    if (!next) return null

    return {
        eventName: next.category.event.name,
        categoryName: next.category.name,
        location: next.category.event.location,
        startDate: next.category.event.startDate!,
    }
}

function toDisciplineProgress(
    participations: ParticipationWithCategory[]
): DisciplineProgressDto[] {
    return (['DRESSAGE', 'SHOW_JUMPING'] as const).map((discipline) => {
        const relevant = participations.filter(
            (p) =>
                p.category.discipline === discipline &&
                p.percentage !== null
        )
        const avgPercentage =
            relevant.length > 0
                ? relevant.reduce(
                      (sum, p) => sum + Number(p.percentage!.toString()),
                      0
                  ) / relevant.length
                : null

        return { discipline, avgPercentage, count: relevant.length }
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

        const rank = await this.computeAthleteRank(athlete.id)

        return {
            medals: toMedals(athlete.participations),
            history: toHistory(athlete.participations),
            rank,
            nextEvent: toNextEvent(athlete.participations),
            disciplineProgress: toDisciplineProgress(athlete.participations),
        }
    }

    private async computeAthleteRank(
        athleteId: string
    ): Promise<AthleteRankDto | null> {
        const athletes = await this.prisma.athlete.findMany({
            select: { id: true, participations: { select: { rank: true } } },
        })
        if (athletes.length === 0) return null

        const ranked = athletes
            .map((a) => ({ id: a.id, medals: toMedals(a.participations) }))
            .sort(
                (a, b) =>
                    b.medals.gold - a.medals.gold ||
                    b.medals.silver - a.medals.silver ||
                    b.medals.bronze - a.medals.bronze
            )

        const position = ranked.findIndex((a) => a.id === athleteId) + 1
        return { position, totalAthletes: ranked.length }
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
                                    include: {
                                        user: { select: userNameSelect },
                                        participations: {
                                            include: {
                                                category: {
                                                    include: { event: true },
                                                },
                                                evaluations: true,
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

        const athletesNeedingAttention = this.computeAttention(coach.groups)
        const upcomingEvents = this.computeCoachUpcomingEvents(coach.groups)

        return {
            ownParticipation: athlete
                ? {
                      medals: toMedals(athlete.participations),
                      history: toHistory(athlete.participations),
                      rank: await this.computeAthleteRank(athlete.id),
                      nextEvent: toNextEvent(athlete.participations),
                      disciplineProgress: toDisciplineProgress(
                          athlete.participations
                      ),
                  }
                : null,
            groups,
            overall: {
                totalAthletes,
                totalParticipations: allParticipations.length,
                medals: toMedals(allParticipations),
            },
            athletesNeedingAttention,
            upcomingEvents,
        }
    }

    private computeAttention(
        groups: {
            name: string
            athletes: {
                athlete: {
                    id: string
                    user: { firstName: string | null; lastName: string | null; email: string }
                    participations: (ParticipationWithCategory & {
                        evaluations: { finalized: boolean }[]
                    })[]
                }
            }[]
        }[]
    ): AthleteAttentionDto[] {
        const now = Date.now()
        const attention: AthleteAttentionDto[] = []

        for (const group of groups) {
            for (const membership of group.athletes) {
                const athlete = membership.athlete
                const dated = athlete.participations.filter(
                    (p) => p.category.event.startDate
                )
                const lastDate = dated.length
                    ? Math.max(
                          ...dated.map((p) =>
                              new Date(
                                  p.category.event.startDate!
                              ).getTime()
                          )
                      )
                    : null
                const daysSince = lastDate
                    ? (now - lastDate) / 86_400_000
                    : null

                const latestCompeted = [...athlete.participations]
                    .filter((p) => p.status === 'COMPETED')
                    .sort(
                        (a, b) =>
                            new Date(
                                b.category.event.startDate ?? 0
                            ).getTime() -
                            new Date(
                                a.category.event.startDate ?? 0
                            ).getTime()
                    )[0]
                const hasIncompleteProtocol = latestCompeted
                    ? !latestCompeted.evaluations.some((e) => e.finalized)
                    : false

                if (daysSince === null || daysSince > ATTENTION_WINDOW_DAYS) {
                    attention.push({
                        id: athlete.id,
                        name: formatName(athlete.user),
                        groupName: group.name,
                        reason: 'NO_RECENT_RESULTS',
                    })
                } else if (hasIncompleteProtocol) {
                    attention.push({
                        id: athlete.id,
                        name: formatName(athlete.user),
                        groupName: group.name,
                        reason: 'INCOMPLETE_PROTOCOL',
                    })
                }
            }
        }

        return attention.slice(0, 10)
    }

    private computeCoachUpcomingEvents(
        groups: {
            athletes: {
                athlete: {
                    id: string
                    participations: ParticipationWithCategory[]
                }
            }[]
        }[]
    ): CoachUpcomingEventDto[] {
        const now = Date.now()
        const eventMap = new Map<
            string,
            CoachUpcomingEventDto & { athleteIds: Set<string> }
        >()

        for (const group of groups) {
            for (const membership of group.athletes) {
                for (const p of membership.athlete.participations) {
                    const event = p.category.event
                    if (
                        !event.startDate ||
                        new Date(event.startDate).getTime() < now ||
                        !ACTIVE_EVENT_STATUSES.includes(event.status)
                    ) {
                        continue
                    }
                    const key = `${event.name}::${event.startDate.toISOString()}`
                    const existing = eventMap.get(key)
                    if (existing) {
                        existing.athleteIds.add(membership.athlete.id)
                    } else {
                        eventMap.set(key, {
                            id: key,
                            eventName: event.name,
                            startDate: event.startDate,
                            location: event.location,
                            athleteCount: 0,
                            athleteIds: new Set([membership.athlete.id]),
                        })
                    }
                }
            }
        }

        return Array.from(eventMap.values())
            .map((e) => ({
                id: e.id,
                eventName: e.eventName,
                startDate: e.startDate,
                location: e.location,
                athleteCount: e.athleteIds.size,
            }))
            .sort(
                (a, b) =>
                    new Date(a.startDate!).getTime() -
                    new Date(b.startDate!).getTime()
            )
    }

    async getModeratorStats(): Promise<ModeratorProfileStatsDto> {
        const [athletes, coaches, groups, events] = await Promise.all([
            this.prisma.user.count({ where: { role: 'ATHLETE' } }),
            this.prisma.user.count({ where: { role: 'COACH' } }),
            this.prisma.group.count(),
            this.prisma.event.count(),
        ])

        const [recentActivity, pending] = await Promise.all([
            this.getRecentActivity(),
            this.getPendingItems(),
        ])

        return {
            athletes,
            coaches,
            groups,
            events,
            note: 'Panou temporar — secțiunea dedicată moderatorilor va fi definită ulterior.',
            recentActivity,
            pending,
        }
    }

    private async getRecentActivity(): Promise<RecentActivityItemDto[]> {
        const [recentAthletes, recentCoaches, recentEvents] =
            await Promise.all([
                this.prisma.user.findMany({
                    where: { role: 'ATHLETE' },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { ...userNameSelect, createdAt: true },
                }),
                this.prisma.user.findMany({
                    where: { role: 'COACH' },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { ...userNameSelect, createdAt: true },
                }),
                this.prisma.event.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { name: true, createdAt: true },
                }),
            ])

        const items: RecentActivityItemDto[] = [
            ...recentAthletes.map((u) => ({
                type: 'ATHLETE' as const,
                label: `Sportiv nou: ${formatName(u)}`,
                createdAt: u.createdAt,
            })),
            ...recentCoaches.map((u) => ({
                type: 'COACH' as const,
                label: `Antrenor nou: ${formatName(u)}`,
                createdAt: u.createdAt,
            })),
            ...recentEvents.map((e) => ({
                type: 'EVENT' as const,
                label: `Competiție creată: ${e.name}`,
                createdAt: e.createdAt,
            })),
        ]

        return items
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 8)
    }

    private async getPendingItems(): Promise<
        ModeratorProfileStatsDto['pending']
    > {
        const [draftEvents, draftEventsCount, unfinished, unfinishedCount] =
            await Promise.all([
                this.prisma.event.findMany({
                    where: { status: 'DRAFT' },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { name: true },
                }),
                this.prisma.event.count({ where: { status: 'DRAFT' } }),
                this.prisma.evaluation.findMany({
                    where: { finalized: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        participation: {
                            select: {
                                athlete: {
                                    select: { user: { select: userNameSelect } },
                                },
                                category: {
                                    select: {
                                        event: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                }),
                this.prisma.evaluation.count({ where: { finalized: false } }),
            ])

        const items: PendingItemDto[] = [
            ...draftEvents.map((e) => ({
                type: 'DRAFT_EVENT' as const,
                label: `Competiție nepublicată: ${e.name}`,
            })),
            ...unfinished.map((ev) => ({
                type: 'UNFINISHED_EVALUATION' as const,
                label: `Evaluare nefinalizată: ${formatName(ev.participation.athlete.user)} — ${ev.participation.category.event.name}`,
            })),
        ]

        return {
            draftEvents: draftEventsCount,
            unfinishedEvaluations: unfinishedCount,
            items,
        }
    }
}
