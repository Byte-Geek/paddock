"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import api from "@/lib/axios";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import {
	AthletesPerGroup,
	EventsTimelinePoint,
	Medals,
	TopCoach,
} from "@/types";

const currentYear = new Date().getFullYear();

export default function StatisticiPage() {
	const [medals, setMedals] = useState<Medals | null>(null);
	const [timeline, setTimeline] = useState<EventsTimelinePoint[]>([]);
	const [athletesPerGroup, setAthletesPerGroup] = useState<
		AthletesPerGroup[]
	>([]);
	const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const [medalsRes, timelineRes, groupsRes, coachesRes] =
					await Promise.all([
						api.get<Medals>("/stats/medals"),
						api.get<EventsTimelinePoint[]>(
							"/stats/events-timeline",
						),
						api.get<AthletesPerGroup[]>(
							"/stats/athletes-per-group",
						),
						api.get<TopCoach[]>("/stats/top-coaches"),
					]);
				setMedals(medalsRes.data);
				setTimeline(timelineRes.data);
				setAthletesPerGroup(groupsRes.data);
				setTopCoaches(coachesRes.data);
			} catch (error) {
				console.error("Failed to load stats", error);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, []);

	return (
		<div>
			<PageHeader
				title="Statistici"
				subtitle="Indicatori de performanță și activitate"
			/>

			{loading ? (
				<LoadingState className="text-[var(--color-slate-500)]" />
			) : (
				<>
					{/* Medal stats */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<StatCard label="Aur" value={medals?.gold ?? 0} />
						<StatCard label="Argint" value={medals?.silver ?? 0} />
						<StatCard label="Bronz" value={medals?.bronze ?? 0} />
						<StatCard
							label="Total participări"
							value={medals?.totalParticipations ?? 0}
						/>
					</div>

					{/* Charts row 1 */}
					<div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
						<div className="bg-surface rounded-md border border-[var(--color-border)]">
							<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
								<h3 className="font-semibold text-[var(--color-blue-900)]">
									Evenimente pe lună
								</h3>
								<div className="flex items-center gap-4 text-xs text-[var(--color-slate-500)]">
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-0.5 bg-[var(--color-blue-600)] inline-block rounded" />{" "}
										{currentYear}
									</span>
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-0.5 bg-[var(--color-blue-300)] inline-block rounded border-dashed border-b" />{" "}
										{currentYear - 1}
									</span>
								</div>
							</div>
							<div className="p-4">
								<LineChart
									series={timeline.map((t) => ({
										month: t.month,
										a: t.currentYear,
										b: t.previousYear,
									}))}
								/>
							</div>
						</div>

						<div className="bg-surface rounded-md border border-[var(--color-border)]">
							<div className="px-5 py-4 border-b border-[var(--color-border-soft)]">
								<h3 className="font-semibold text-[var(--color-blue-900)]">
									Distribuție medalii
								</h3>
							</div>
							<div className="p-5 flex items-center justify-center">
								<DonutChart
									data={[
										{
											label: "Aur",
											value: medals?.gold ?? 0,
											color: "var(--color-gold)",
										},
										{
											label: "Argint",
											value: medals?.silver ?? 0,
											color: "var(--color-silver)",
										},
										{
											label: "Bronz",
											value: medals?.bronze ?? 0,
											color: "var(--color-bronze)",
										},
									]}
								/>
							</div>
						</div>
					</div>

					{/* Charts row 2 */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="bg-surface rounded-md border border-[var(--color-border)]">
							<div className="px-5 py-4 border-b border-[var(--color-border-soft)]">
								<h3 className="font-semibold text-[var(--color-blue-900)]">
									Sportivi per grupă
								</h3>
							</div>
							<div className="p-5">
								{athletesPerGroup.length === 0 ? (
									<div className="text-sm text-[var(--color-slate-500)]">
										Nicio grupă cu sportivi.
									</div>
								) : (
									<BarChart
										data={athletesPerGroup.map((g) => ({
											label: g.name,
											value: g.value,
											color: "var(--color-blue-600)",
										}))}
									/>
								)}
							</div>
						</div>

						<div className="bg-surface rounded-md border border-[var(--color-border)]">
							<div className="px-5 py-4 border-b border-[var(--color-border-soft)]">
								<h3 className="font-semibold text-[var(--color-blue-900)]">
									Top antrenori · medalii de aur
								</h3>
							</div>
							<div className="py-2">
								{topCoaches.length === 0 && (
									<div className="px-5 py-6 text-sm text-[var(--color-slate-500)]">
										Nicio medalie înregistrată încă.
									</div>
								)}
								{topCoaches.map((c) => {
									const name = formatFullName(c.firstName, c.lastName, c.email);
									const w =
										(c.medals /
											Math.max(
												...topCoaches.map(
													(x) => x.medals,
												),
												1,
											)) *
										100;
									return (
										<div
											key={c.id}
											className="flex items-center gap-3 px-5 py-2.5"
										>
											<div className="w-7 h-7 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-800)] grid place-items-center text-xs font-bold flex-shrink-0">
												{name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-[13px] font-semibold text-[var(--color-blue-900)] truncate">
													{name}
												</div>
												<div className="mt-1.5 h-1.5 bg-[var(--color-blue-100)] rounded-full overflow-hidden">
													<div
														className="h-full bg-[var(--color-blue-600)] rounded-full transition-all"
														style={{
															width: `${w}%`,
														}}
													/>
												</div>
											</div>
											<div className="font-bold text-[13px] text-[var(--color-blue-900)]">
												{c.medals}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
