"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CoachProfileStats } from "@/types";
import MedalsSummary from "@/components/profil/MedalsSummary";
import ParticipationHistoryTable from "@/components/profil/ParticipationHistoryTable";
import LoadingState from "@/components/ui/LoadingState";

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
		return <LoadingState className="text-[var(--color-slate-500)]" />;
	}
	if (!stats) {
		return (
			<div className="rounded-md border border-[var(--color-border-soft)] bg-surface p-6 text-sm text-[var(--color-slate-500)]">
				Nu s-au putut încărca statisticile.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{stats.ownParticipation && (
				<div>
					<h3 className="font-semibold text-[var(--color-ink-800)] mb-3">
						Rezultatele mele ca sportiv
					</h3>
					<div className="flex flex-col gap-4">
						<MedalsSummary medals={stats.ownParticipation.medals} />
						<ParticipationHistoryTable
							history={stats.ownParticipation.history}
						/>
					</div>
				</div>
			)}

			<div>
				<h3 className="font-semibold text-[var(--color-ink-800)] mb-3">
					Statistici generale — grupele mele
				</h3>
				<div className="grid grid-cols-3 gap-4 mb-4">
					<div className="bg-surface rounded-md border border-[var(--color-border-soft)] p-4 text-center">
						<div className="text-xl font-bold text-[var(--color-ink-800)]">
							{stats.groups.length}
						</div>
						<div className="text-[11px] text-[var(--color-slate-500)] uppercase tracking-wide">
							Grupe
						</div>
					</div>
					<div className="bg-surface rounded-md border border-[var(--color-border-soft)] p-4 text-center">
						<div className="text-xl font-bold text-[var(--color-ink-800)]">
							{stats.overall.totalAthletes}
						</div>
						<div className="text-[11px] text-[var(--color-slate-500)] uppercase tracking-wide">
							Sportivi
						</div>
					</div>
					<div className="bg-surface rounded-md border border-[var(--color-border-soft)] p-4 text-center">
						<div className="text-xl font-bold text-[var(--color-ink-800)]">
							{stats.overall.totalParticipations}
						</div>
						<div className="text-[11px] text-[var(--color-slate-500)] uppercase tracking-wide">
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
				<h3 className="font-semibold text-[var(--color-ink-800)] mb-3">
					Statistici pe grupe
				</h3>
				{stats.groups.length === 0 ? (
					<div className="rounded-md border border-[var(--color-border-soft)] bg-surface p-6 text-sm text-[var(--color-slate-500)]">
						Nu ai nicio grupă asociată.
					</div>
				) : (
					<div className="bg-surface rounded-md border border-[var(--color-border-soft)] overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-[var(--color-silver-bg)]">
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
											className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide"
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
										className={`border-t border-[var(--color-border-soft)] ${i % 2 === 0 ? "bg-surface" : "bg-[var(--color-surface-subtle)]"}`}
									>
										<td className="px-5 py-3 font-semibold text-[var(--color-ink-800)]">
											{g.name}
										</td>
										<td className="px-5 py-3 text-[var(--color-slate-500)]">
											{g.athleteCount}
										</td>
										<td className="px-5 py-3 text-[var(--color-ink-800)]">
											{g.medals.gold}
										</td>
										<td className="px-5 py-3 text-[var(--color-ink-800)]">
											{g.medals.silver}
										</td>
										<td className="px-5 py-3 text-[var(--color-ink-800)]">
											{g.medals.bronze}
										</td>
										<td className="px-5 py-3 text-[var(--color-ink-800)]">
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
