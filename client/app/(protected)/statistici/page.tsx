"use client";

import { useEffect, useState } from "react";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import Panel from "@/components/ui/Panel";
import Avatar from "@/components/ui/Avatar";
import api from "@/lib/axios";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import {
	AthletesPerGroup,
	EventsTimelinePoint,
	Medals,
	Overview,
	TopCoach,
} from "@/types";

const currentYear = new Date().getFullYear();

export default function StatisticiPage() {
	const [medals, setMedals] = useState<Medals | null>(null);
	const [overview, setOverview] = useState<Overview | null>(null);
	const [timeline, setTimeline] = useState<EventsTimelinePoint[]>([]);
	const [athletesPerGroup, setAthletesPerGroup] = useState<
		AthletesPerGroup[]
	>([]);
	const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const [
					medalsRes,
					overviewRes,
					timelineRes,
					groupsRes,
					coachesRes,
				] = await Promise.all([
					api.get<Medals>("/stats/medals"),
					api.get<Overview>("/stats/overview"),
					api.get<EventsTimelinePoint[]>("/stats/events-timeline"),
					api.get<AthletesPerGroup[]>("/stats/athletes-per-group"),
					api.get<TopCoach[]>("/stats/top-coaches"),
				]);
				setMedals(medalsRes.data);
				setOverview(overviewRes.data);
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

	const totalMedals =
		(medals?.gold ?? 0) + (medals?.silver ?? 0) + (medals?.bronze ?? 0);

	return (
		<div className="flex flex-col gap-5">
			<div className="pb-6 border-b border-border-soft">
				<div className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
					Analiză · Sezon {currentYear}
				</div>
				<h1 className="text-[28px] sm:text-[32px] font-bold text-ink-800 tracking-[-0.02em]">
					Statistici federație
				</h1>
				<p className="text-[14px] text-slate-500 mt-2 max-w-[54ch] leading-relaxed">
					Indicatori de performanță și activitate pentru sezonul{" "}
					{currentYear}.
				</p>
			</div>

			{loading ? (
				<LoadingState className="text-[var(--color-slate-500)]" />
			) : (
				<>
					{/* KPI row */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div className="rounded-lg p-4 bg-surface border border-border shadow-[var(--shadow-panel)] transition-shadow duration-300 hover:shadow-[var(--shadow-panel-hover)]">
							<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
								Participări totale
							</div>
							<div className="font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5 text-ink-800">
								{medals?.totalParticipations ?? 0}
							</div>
							<div className="text-[11px] font-semibold text-blue-600 mt-2">
								Sezon {currentYear}
							</div>
						</div>

						<div className="rounded-lg p-4 bg-surface border border-border shadow-[var(--shadow-panel)] transition-shadow duration-300 hover:shadow-[var(--shadow-panel-hover)]">
							<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
								Medalii acordate
							</div>
							<div className="font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5 text-ink-800">
								{totalMedals}
							</div>
							<div className="text-[11px] font-semibold text-blue-600 mt-2">
								{medals?.gold ?? 0} aur · {medals?.silver ?? 0}{" "}
								argint · {medals?.bronze ?? 0} bronz
							</div>
						</div>

						<div className="rounded-lg p-4 bg-surface border border-border shadow-[var(--shadow-panel)] transition-shadow duration-300 hover:shadow-[var(--shadow-panel-hover)]">
							<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
								Scor mediu
							</div>
							<div className="font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5 text-ink-800">
								{overview?.averageScorePercentage !== null &&
								overview?.averageScorePercentage !== undefined
									? `${overview.averageScorePercentage}%`
									: "—"}
							</div>
							<div className="text-[11px] font-semibold text-blue-600 mt-2">
								medie evaluări finalizate
							</div>
						</div>

						<div className="rounded-lg p-4 bg-blue-600 text-white shadow-[var(--shadow-panel)]">
							<div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-100">
								Competiții încheiate
							</div>
							<div className="font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5">
								{overview?.competitionsCompleted ?? 0}
							</div>
							<div className="text-[11px] font-semibold text-blue-100 mt-2">
								din {overview?.competitionsTotal ?? 0} planificate
							</div>
						</div>
					</div>

					{/* Charts row 1 */}
					<div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 mb-4 items-start">
						<Panel
							title="Evoluție lunară · evenimente"
							action={
								<div className="flex items-center gap-4 text-[11px] text-slate-500">
									<span className="flex items-center gap-1.5">
										<span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-sm" />
										{currentYear}
									</span>
									<span className="flex items-center gap-1.5">
										<span className="w-2.5 h-2.5 bg-blue-300 inline-block rounded-sm" />
										{currentYear - 1}
									</span>
								</div>
							}
						>
							<MonthlyBarChart
								series={timeline.map((t) => ({
									month: t.month,
									a: t.currentYear,
									b: t.previousYear,
								}))}
							/>
						</Panel>

						<Panel title="Distribuție medalii">
							<div className="flex items-center justify-center">
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
						</Panel>
					</div>

					{/* Athletes per group */}
					<Panel
						title="Sportivi per grupă"
						subtitle={`Top ${athletesPerGroup.length} grupe după număr de sportivi`}
						className="mb-4"
					>
						{athletesPerGroup.length === 0 ? (
							<div className="text-[13px] text-slate-500">
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
					</Panel>

					{/* Top coaches */}
					<Panel title="Top antrenori · medalii de aur" noBodyPadding>
						{topCoaches.length === 0 && (
							<div className="px-5 py-6 text-[13px] text-slate-500">
								Nicio medalie înregistrată încă.
							</div>
						)}
						{topCoaches.map((c, i) => {
							const name = formatFullName(c.firstName, c.lastName, c.email);
							const w =
								(c.medals /
									Math.max(
										...topCoaches.map((x) => x.medals),
										1,
									)) *
								100;
							return (
								<div
									key={c.id}
									className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? "border-t border-border-soft" : ""}`}
								>
									<Avatar name={name} size="sm" />
									<div className="flex-1 min-w-0">
										<div className="text-[13px] font-semibold text-ink-800 truncate">
											{name}
										</div>
										<div className="mt-1.5 h-1.5 bg-blue-50 rounded-full overflow-hidden">
											<div
												className="h-full bg-blue-600 rounded-full transition-all duration-500"
												style={{ width: `${w}%` }}
											/>
										</div>
									</div>
									<div className="font-mono font-bold text-[13px] text-ink-800">
										{c.medals}
									</div>
								</div>
							);
						})}
					</Panel>
				</>
			)}
		</div>
	);
}
