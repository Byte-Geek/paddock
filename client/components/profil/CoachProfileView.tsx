"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CoachProfileStats } from "@/types";
import MedalsSummary from "@/components/profil/MedalsSummary";
import DisciplineProgress from "@/components/profil/DisciplineProgress";
import ParticipationHistoryTable from "@/components/profil/ParticipationHistoryTable";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import { MONTHS } from "@/lib/utils";

const attentionLabels: Record<string, string> = {
	NO_RECENT_RESULTS: "Fără rezultate recente",
	INCOMPLETE_PROTOCOL: "Protocol incomplet",
};

export default function CoachProfileView() {
	const [stats, setStats] = useState<CoachProfileStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<CoachProfileStats>(
					"/profile/coach",
				);
				setStats(data);
			} catch (error) {
				console.error("Failed to load coach profile stats", error);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	if (loading) {
		return <LoadingState className="text-slate-500" />;
	}
	if (!stats) {
		return (
			<div className="rounded-md border border-border-soft bg-surface p-6 text-sm text-slate-500">
				Nu s-au putut încărca statisticile.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{stats.ownParticipation && (
				<div>
					<h3 className="font-semibold text-ink-800 mb-3">
						Rezultatele mele ca sportiv
					</h3>
					<div className="flex flex-col gap-4">
						<MedalsSummary medals={stats.ownParticipation.medals} />
						<DisciplineProgress
							data={stats.ownParticipation.disciplineProgress}
						/>
						<ParticipationHistoryTable
							history={stats.ownParticipation.history}
						/>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4 items-start">
				<div>
					<h3 className="font-semibold text-ink-800 mb-3">
						Sportivi care necesită atenție
					</h3>
					{stats.athletesNeedingAttention.length === 0 ? (
						<div className="rounded-md border border-border-soft bg-surface p-6 text-sm text-slate-500">
							Toți sportivii tăi sunt la zi.
						</div>
					) : (
						<div className="bg-surface rounded-md border border-border-soft overflow-hidden">
							{stats.athletesNeedingAttention.map((a, i) => (
								<div
									key={a.id}
									className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-border-soft" : ""}`}
								>
									<div className="min-w-0">
										<div className="font-semibold text-[13px] text-ink-800 truncate">
											{a.name}
										</div>
										<div className="text-[11.5px] text-slate-500 mt-0.5">
											{a.groupName}
										</div>
									</div>
									<Badge
										variant={
											a.reason === "NO_RECENT_RESULTS"
												? "gray"
												: "warning"
										}
										className="flex-shrink-0"
									>
										{attentionLabels[a.reason]}
									</Badge>
								</div>
							))}
						</div>
					)}
				</div>

				<div>
					<h3 className="font-semibold text-ink-800 mb-3">
						Competiții apropiate — grupele mele
					</h3>
					{stats.upcomingEvents.length === 0 ? (
						<div className="rounded-md border border-border-soft bg-surface p-6 text-sm text-slate-500">
							Nicio competiție programată pentru sportivii tăi.
						</div>
					) : (
						<div className="bg-surface rounded-md border border-border-soft overflow-hidden">
							{stats.upcomingEvents.map((e, i) => {
								const startDate = e.startDate
									? new Date(e.startDate)
									: null;
								return (
									<div
										key={e.id}
										className={`flex gap-3 items-center px-4 py-3 ${i > 0 ? "border-t border-border-soft" : ""}`}
									>
										{startDate && (
											<div className="w-11 text-center flex-shrink-0 border border-blue-100 bg-blue-50 rounded-md py-1.5">
												<div className="text-[9px] font-bold text-blue-800 tracking-[0.06em] uppercase">
													{MONTHS[startDate.getMonth()]}
												</div>
												<div className="font-mono text-[17px] font-bold text-ink-900 leading-none tabular-nums">
													{startDate.getDate()}
												</div>
											</div>
										)}
										<div className="min-w-0 flex-1">
											<div className="font-semibold text-[13px] text-ink-800 truncate">
												{e.eventName}
											</div>
											{e.location && (
												<div className="text-[11.5px] text-slate-500 mt-0.5 truncate">
													{e.location}
												</div>
											)}
										</div>
										<Badge
											variant="default"
											className="flex-shrink-0"
										>
											{e.athleteCount} sportiv
											{e.athleteCount !== 1 ? "i" : ""}
										</Badge>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-semibold text-ink-800 mb-3">
					Statistici generale — grupele mele
				</h3>
				<div className="grid grid-cols-3 gap-4 mb-4">
					<div className="bg-surface rounded-md border border-border-soft p-4 text-center">
						<div className="text-xl font-bold text-ink-800">
							{stats.groups.length}
						</div>
						<div className="text-[11px] text-slate-500 uppercase tracking-wide">
							Grupe
						</div>
					</div>
					<div className="bg-surface rounded-md border border-border-soft p-4 text-center">
						<div className="text-xl font-bold text-ink-800">
							{stats.overall.totalAthletes}
						</div>
						<div className="text-[11px] text-slate-500 uppercase tracking-wide">
							Sportivi
						</div>
					</div>
					<div className="bg-surface rounded-md border border-border-soft p-4 text-center">
						<div className="text-xl font-bold text-ink-800">
							{stats.overall.totalParticipations}
						</div>
						<div className="text-[11px] text-slate-500 uppercase tracking-wide">
							Participări
						</div>
					</div>
				</div>
				<MedalsSummary
					medals={stats.overall.medals}
					label="Participări"
				/>
			</div>

			<div>
				<h3 className="font-semibold text-ink-800 mb-3">
					Statistici pe grupe
				</h3>
				{stats.groups.length === 0 ? (
					<div className="rounded-md border border-border-soft bg-surface p-6 text-sm text-slate-500">
						Nu ai nicio grupă asociată.
					</div>
				) : (
					<div className="bg-surface rounded-md border border-border-soft overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-silver-bg">
								<tr>
									{[
										"Grupă",
										"Sportivi",
										"🥇",
										"🥈",
										"🥉",
										"Total participări",
									].map((h) => (
										<th
											key={h}
											className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{stats.groups.map((g, i) => (
									<tr
										key={g.id}
										className={`border-t border-border-soft ${i % 2 === 0 ? "bg-surface" : "bg-surface-subtle"}`}
									>
										<td className="px-5 py-3 font-semibold text-ink-800">
											{g.name}
										</td>
										<td className="px-5 py-3 text-slate-500">
											{g.athleteCount}
										</td>
										<td className="px-5 py-3 text-ink-800">
											{g.medals.gold}
										</td>
										<td className="px-5 py-3 text-ink-800">
											{g.medals.silver}
										</td>
										<td className="px-5 py-3 text-ink-800">
											{g.medals.bronze}
										</td>
										<td className="px-5 py-3 text-ink-800">
											{g.medals.total}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
