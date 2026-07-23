"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import TabBar from "@/components/ui/TabBar";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { MONTHS } from "@/lib/utils";
import api from "@/lib/axios";
import { CompetitionEvent } from "@/types";
import { EVENT_STATUS_VARIANTS } from "@/lib/constants/event-status";

const statusLabels: Record<string, string> = {
	DRAFT: "Ciornă",
	PUBLISHED: "Publicat",
	ONGOING: "În desfășurare",
	COMPLETED: "Finalizat",
};

const statusVariants = EVENT_STATUS_VARIANTS;

export default function EvenimentePage() {
	const [events, setEvents] = useState<CompetitionEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("upcoming");

	useEffect(() => {
		const loadEvents = async () => {
			try {
				const { data } = await api.get<CompetitionEvent[]>("/events");
				setEvents(data);
			} catch (error) {
				console.error("Failed to load events", error);
			} finally {
				setLoading(false);
			}
		};

		loadEvents();
	}, []);

	const now = new Date();
	const upcoming = events.filter((e) =>
		e.startDate ? new Date(e.startDate) >= now : true,
	);
	const past = events.filter(
		(e) => e.startDate && new Date(e.startDate) < now,
	);
	const list = tab === "upcoming" ? upcoming : past;

	return (
		<div>
			<PageHeader
				title="Evenimente"
				subtitle="Calendarul activităților școlii — trecute, curente și viitoare."
			/>

			<TabBar
				tabs={[
					{
						key: "upcoming",
						label: "Următoare",
						count: upcoming.length,
					},
					{ key: "past", label: "Trecute", count: past.length },
				]}
				active={tab}
				onChange={setTab}
			/>

			{loading ? (
				<LoadingState />
			) : list.length === 0 ? (
				<EmptyState>Niciun eveniment găsit.</EmptyState>
			) : (
				<div className="flex flex-col gap-3">
					{list.map((e) => {
						const date = e.startDate ? new Date(e.startDate) : null;
						return (
							<div
								key={e.id}
								className="bg-surface rounded-md border border-[var(--color-border)] p-5 grid grid-cols-[80px_1fr] gap-5 items-center hover:shadow-[var(--shadow-panel-hover)] hover:-translate-y-0.5 transition-all duration-300"
							>
								<div className="text-center bg-gradient-to-b from-[var(--color-blue-800)] to-[var(--color-ink-900)] text-white px-1 py-2.5 rounded-md">
									<div className="text-[10px] font-bold opacity-70 tracking-[0.08em] uppercase">
										{date ? MONTHS[date.getMonth()] : "—"}
									</div>
									<div className="font-mono text-[26px] font-bold leading-none tabular-nums">
										{date ? date.getDate() : "—"}
									</div>
									<div className="text-[10px] opacity-50 mt-[2px]">
										{date ? date.getFullYear() : ""}
									</div>
								</div>

								<div>
									<div className="flex items-center gap-2 mb-1.5">
										<Badge
											variant={
												statusVariants[e.status] ??
												"gray"
											}
										>
											{statusLabels[e.status] ?? e.status}
										</Badge>
									</div>
									<div className="font-bold text-[16px] text-[var(--color-blue-900)]">
										{e.name}
									</div>
									{e.description && (
										<div className="text-[13px] text-[var(--color-slate-500)] mt-1">
											{e.description}
										</div>
									)}
									{e.location && (
										<div className="text-[12px] text-[var(--color-slate-500)] mt-1">
											{e.location}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
