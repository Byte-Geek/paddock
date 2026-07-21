"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ModeratorProfileStats } from "@/types";
import StatCard from "@/components/ui/StatCard";

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
		return <div className="text-sm text-[#8896b3]">Se încarcă...</div>;
	}
	if (!stats) {
		return (
			<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
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

			<div className="rounded-xl border border-dashed border-[#b5d7f1] bg-[#f1f7fc] p-5 text-sm text-[#205280]">
				{stats.note}
			</div>
		</div>
	);
}
