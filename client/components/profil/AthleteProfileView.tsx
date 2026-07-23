"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { AthleteProfileStats } from "@/types";
import MedalsSummary from "@/components/profil/MedalsSummary";
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
			<MedalsSummary medals={stats.medals} />

			<div>
				<h3 className="font-semibold text-[var(--color-ink-800)] mb-3">
					Istoricul participărilor
				</h3>
				<ParticipationHistoryTable history={stats.history} />
			</div>
		</div>
	);
}
