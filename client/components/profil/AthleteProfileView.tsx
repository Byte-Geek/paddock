"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { AthleteProfileStats } from "@/types";
import MedalsSummary from "@/components/profil/MedalsSummary";
import DisciplineProgress from "@/components/profil/DisciplineProgress";
import ParticipationHistoryTable from "@/components/profil/ParticipationHistoryTable";
import LoadingState from "@/components/ui/LoadingState";

export default function AthleteProfileView() {
	const [stats, setStats] = useState<AthleteProfileStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<AthleteProfileStats>(
					"/profile/athlete",
				);
				setStats(data);
			} catch (error) {
				console.error("Failed to load athlete profile stats", error);
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
			<div className="grid grid-cols-2 gap-4">
				<div className="bg-surface rounded-md border border-border-soft p-4">
					<div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">
						Poziție în clasament
					</div>
					{stats.rank ? (
						<>
							<div className="font-mono text-2xl font-bold text-ink-800 tabular-nums">
								#{stats.rank.position}
							</div>
							<div className="text-[12px] text-slate-500 mt-1">
								din {stats.rank.totalAthletes} sportivi (după
								medalii)
							</div>
						</>
					) : (
						<div className="text-[13px] text-slate-500 mt-1">
							Indisponibil
						</div>
					)}
				</div>

				<div className="bg-surface rounded-md border border-border-soft p-4">
					<div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">
						Următoarea competiție
					</div>
					{stats.nextEvent ? (
						<>
							<div className="font-semibold text-[15px] text-ink-800 truncate">
								{stats.nextEvent.eventName}
							</div>
							<div className="text-[12px] text-slate-500 mt-1">
								{new Date(
									stats.nextEvent.startDate,
								).toLocaleDateString("ro-RO", {
									day: "numeric",
									month: "long",
								})}
								{stats.nextEvent.location &&
									` · ${stats.nextEvent.location}`}
							</div>
						</>
					) : (
						<div className="text-[13px] text-slate-500 mt-1">
							Nicio competiție programată
						</div>
					)}
				</div>
			</div>

			<DisciplineProgress data={stats.disciplineProgress} />

			<MedalsSummary medals={stats.medals} />

			<div>
				<h3 className="font-semibold text-ink-800 mb-3">
					Istoricul participărilor
				</h3>
				<ParticipationHistoryTable history={stats.history} />
			</div>
		</div>
	);
}
