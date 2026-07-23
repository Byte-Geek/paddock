"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ModeratorProfileStats } from "@/types";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

const activityIcon: Record<string, string> = {
	ATHLETE: "🏇",
	COACH: "🎓",
	EVENT: "🏆",
};

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
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<StatCard label="Sportivi" value={stats.athletes} />
				<StatCard label="Antrenori" value={stats.coaches} />
				<StatCard label="Grupe" value={stats.groups} />
				<StatCard label="Evenimente" value={stats.events} />
			</div>

			<div className="grid grid-cols-2 gap-4 items-start">
				<div>
					<h3 className="font-semibold text-ink-800 mb-3">
						Activitate recentă
					</h3>
					{stats.recentActivity.length === 0 ? (
						<EmptyState>
							Nicio activitate înregistrată încă.
						</EmptyState>
					) : (
						<div className="bg-surface rounded-md border border-border-soft overflow-hidden">
							{stats.recentActivity.map((item, i) => (
								<div
									key={`${item.type}-${item.createdAt}-${i}`}
									className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border-soft" : ""}`}
								>
									<span className="text-base flex-shrink-0">
										{activityIcon[item.type] ?? "•"}
									</span>
									<div className="min-w-0 flex-1 text-[13px] text-ink-800 truncate">
										{item.label}
									</div>
									<div className="text-[11px] text-slate-500 flex-shrink-0">
										{new Date(
											item.createdAt,
										).toLocaleDateString("ro-RO", {
											day: "numeric",
											month: "short",
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div>
					<h3 className="font-semibold text-ink-800 mb-3">
						În așteptare
					</h3>
					<div className="grid grid-cols-2 gap-3 mb-3">
						<div className="bg-surface rounded-md border border-border-soft p-4 text-center">
							<div className="text-xl font-bold text-ink-800">
								{stats.pending.draftEvents}
							</div>
							<div className="text-[11px] text-slate-500 uppercase tracking-wide">
								Competiții nepublicate
							</div>
						</div>
						<div className="bg-surface rounded-md border border-border-soft p-4 text-center">
							<div className="text-xl font-bold text-ink-800">
								{stats.pending.unfinishedEvaluations}
							</div>
							<div className="text-[11px] text-slate-500 uppercase tracking-wide">
								Evaluări nefinalizate
							</div>
						</div>
					</div>
					{stats.pending.items.length === 0 ? (
						<EmptyState>Nimic în așteptare.</EmptyState>
					) : (
						<div className="bg-surface rounded-md border border-border-soft overflow-hidden">
							{stats.pending.items.map((item, i) => (
								<div
									key={i}
									className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border-soft" : ""}`}
								>
									<div className="min-w-0 flex-1 text-[13px] text-ink-800 truncate">
										{item.label}
									</div>
									<Badge
										variant={
											item.type === "DRAFT_EVENT"
												? "gray"
												: "warning"
										}
										className="flex-shrink-0"
									>
										{item.type === "DRAFT_EVENT"
											? "Draft"
											: "Nefinalizat"}
									</Badge>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
