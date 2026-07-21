"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import TabBar from "@/components/ui/TabBar";
import Badge from "@/components/ui/Badge";
import { MONTHS } from "@/lib/utils";
import api from "@/lib/axios";
import { CompetitionEvent } from "@/types";

const statusLabels: Record<string, string> = {
	DRAFT: "Ciornă",
	PUBLISHED: "Publicat",
	ONGOING: "În desfășurare",
	COMPLETED: "Finalizat",
	CANCELLED: "Anulat",
};

const statusVariants: Record<
	string,
	"gray" | "warning" | "success" | "danger" | "blue"
> = {
	DRAFT: "gray",
	PUBLISHED: "blue",
	ONGOING: "warning",
	COMPLETED: "success",
	CANCELLED: "danger",
};

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
				<div className="text-sm text-[#6b7d92]">Se încarcă...</div>
			) : list.length === 0 ? (
				<div className="rounded-[10px] border border-[#e2e8f0] bg-white p-6 text-sm text-[#6b7d92]">
					Niciun eveniment găsit.
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{list.map((e) => {
						const date = e.startDate ? new Date(e.startDate) : null;
						return (
							<div
								key={e.id}
								className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 grid grid-cols-[80px_1fr] gap-5 items-center hover:shadow-[0_4px_16px_-4px_rgba(14,39,64,0.08)] transition"
							>
								<div className="text-center bg-gradient-to-b from-[#1a4368] to-[#143654] text-white px-1 py-2.5 rounded-[10px]">
									<div className="text-[10px] font-bold opacity-70 tracking-[0.08em] uppercase">
										{date ? MONTHS[date.getMonth()] : "—"}
									</div>
									<div className="text-[26px] font-bold leading-none">
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
									<div className="font-bold text-[16px] text-[#0e1f33]">
										{e.name}
									</div>
									{e.description && (
										<div className="text-[13px] text-[#6b7d92] mt-1">
											{e.description}
										</div>
									)}
									{e.location && (
										<div className="text-[12px] text-[#8896b3] mt-1">
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
