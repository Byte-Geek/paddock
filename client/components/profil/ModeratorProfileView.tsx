"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ModeratorProfileStats } from "@/types";
import StatCard from "@/components/ui/StatCard";
import LoadingState from "@/components/ui/LoadingState";

export default function ModeratorProfileView() {
	const [stats, setStats] = useState<ModeratorProfileStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<ModeratorProfileStats>(
					"/profile/moderator",
				);
				setStats(data);
			} catch (error) {
				console.error(
					"Failed to load moderator profile stats",
					error,
				);
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
			<div className="grid grid-cols-4 gap-4">
				<StatCard label="Sportivi" value={stats.athletes} />
				<StatCard label="Antrenori" value={stats.coaches} />
				<StatCard label="Grupe" value={stats.groups} />
				<StatCard label="Evenimente" value={stats.events} />
			</div>

			<div className="rounded-md border border-dashed border-[var(--color-blue-300)] bg-[var(--color-blue-50)] p-5 text-sm text-[var(--color-blue-800)]">
				{stats.note}
			</div>
		</div>
	);
}
