"use client";

import { useAuthStore } from "@/store/auth.store";
import { MONTHS, initials, formatFullName } from "@/lib/utils";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
	HomeSummary,
	UpcomingEvent,
	Medals,
	TopCoach,
} from "@/types";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import DataStrip from "@/components/ui/DataStrip";
import Panel from "@/components/ui/Panel";

const currentYear = new Date().getFullYear();

const statIcons = {
	athletes: (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="9" cy="8" r="3.2" />
			<circle cx="17" cy="9" r="2.6" />
			<path d="M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6" />
			<path d="M15 14.3c2.6.4 4.6 2.4 5 5.7" />
		</svg>
	),
	coaches: (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="12" cy="8" r="4" />
			<path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
		</svg>
	),
	groups: (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<path d="M3 9h18M8 4v5" />
		</svg>
	),
	championships: (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="12" cy="9" r="6" />
			<path d="m8.5 14.5-1.8 6L12 18l5.3 2.5-1.8-6" />
		</svg>
	),
};

export default function MainPage() {
	const user = useAuthStore((s) => s.user);
	const firstName = user?.firstName;

	const [summary, setSummary] = useState<HomeSummary | null>(null);
	const [events, setEvents] = useState<UpcomingEvent[]>([]);
	const [medals, setMedals] = useState<Medals | null>(null);
	const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadHome = async () => {
			try {
				const [summaryRes, eventsRes, medalsRes, coachesRes] =
					await Promise.all([
						api.get<HomeSummary>("/home/summary"),
						api.get<UpcomingEvent[]>("/home/upcoming-events"),
						api.get<Medals>("/stats/medals"),
						api.get<TopCoach[]>("/stats/top-coaches"),
					]);
				setSummary(summaryRes.data);
				setEvents(eventsRes.data);
				setMedals(medalsRes.data);
				setTopCoaches(coachesRes.data);
			} catch (error) {
				console.error("Failed to load home data", error);
			} finally {
				setLoading(false);
			}
		};

		loadHome();
	}, []);

	if (loading) {
		return <LoadingState className="text-slate-500" />;
	}

	const stats = [
		{
			key: "athletes",
			label: "Sportivi activi",
			value: summary?.athletes ?? 0,
			delta: `+${summary?.modificationsLastMonth.athletes ?? 0} luna asta`,
		},
		{
			key: "coaches",
			label: "Antrenori",
			value: summary?.coaches ?? 0,
			delta: `+${summary?.modificationsLastMonth.coaches ?? 0} luna asta`,
		},
		{
			key: "groups",
			label: "Grupe",
			value: summary?.groups ?? 0,
			delta: `+${summary?.modificationsLastMonth.groups ?? 0} luna asta`,
		},
		{
			key: "championships",
			label: `Campionate / ${currentYear}`,
			value: summary?.championshipsThisYear ?? 0,
			delta: null,
		},
	] as const;

	return (
		<div className="flex flex-col gap-5">
			<div className="pb-6 border-b border-border-soft animate-[fade-in_0.4s_ease-out]">
				<div className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
					Prezentare generală
				</div>
				<h1 className="text-[32px] font-bold text-ink-800 tracking-[-0.02em]">
					Bună, {firstName || "acolo"}
				</h1>
				<p className="text-[14px] text-slate-500 mt-2 max-w-[54ch] leading-relaxed">
					Platforma digitală a Școlii Sportive Republicane de
					Hipism și Pentatlon Modern din Chișinău — sportivi,
					grupe, competiții și rezultate, la un loc.
				</p>
			</div>

			<DataStrip
				items={stats.map((s) => ({
					key: s.key,
					label: s.label,
					value: s.value,
					delta: s.delta,
					icon: statIcons[s.key],
				}))}
			/>

			<div className="grid grid-cols-[1.7fr_1fr] gap-4 items-start">
				<Panel
					title="Evenimente apropiate"
					subtitle={`${events.length} programate`}
					action={
						<Link
							href="/evenimente"
							className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
						>
							Calendar →
						</Link>
					}
					noBodyPadding
				>
					{events.length === 0 ? (
						<div className="p-5">
							<EmptyState>
								Nu sunt evenimente programate.
							</EmptyState>
						</div>
					) : (
						events.map((e, i) => {
							const startDate = new Date(e.startDate);
							const day = startDate.getDate();
							const month = MONTHS[startDate.getMonth()];
							return (
								<div
									key={e.id}
									className={`group flex gap-3.5 items-center px-5 py-3.5 ${i > 0 ? "border-t border-border-soft" : ""} hover:bg-surface-subtle transition-colors duration-200`}
								>
									<div className="w-11 text-center flex-shrink-0 border border-blue-100 bg-blue-50 rounded-md py-1.5 transition-colors duration-200 group-hover:border-blue-300">
										<div className="text-[9px] font-bold text-blue-800 tracking-[0.06em] uppercase">
											{month}
										</div>
										<div className="font-mono text-[17px] font-bold text-ink-900 leading-none tabular-nums">
											{day}
										</div>
									</div>
									<div className="min-w-0">
										<div className="font-semibold text-[13px] text-ink-800 truncate">
											{e.title}
										</div>
										{e.location && (
											<div className="text-[11.5px] text-slate-500 mt-0.5 truncate">
												{e.location}
											</div>
										)}
									</div>
								</div>
							);
						})
					)}
				</Panel>

				<div className="flex flex-col gap-4">
					<Panel title="Medalii — total">
						<div className="grid grid-cols-3 gap-2.5 text-center">
							<div className="rounded-md bg-gold-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
								<div className="font-mono text-[21px] font-bold text-gold tabular-nums">
									{medals?.gold ?? 0}
								</div>
								<div className="text-[10px] text-slate-500 mt-0.5">
									Aur
								</div>
							</div>
							<div className="rounded-md bg-silver-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
								<div className="font-mono text-[21px] font-bold text-silver tabular-nums">
									{medals?.silver ?? 0}
								</div>
								<div className="text-[10px] text-slate-500 mt-0.5">
									Argint
								</div>
							</div>
							<div className="rounded-md bg-bronze-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
								<div className="font-mono text-[21px] font-bold text-bronze tabular-nums">
									{medals?.bronze ?? 0}
								</div>
								<div className="text-[10px] text-slate-500 mt-0.5">
									Bronz
								</div>
							</div>
						</div>
					</Panel>

					<Panel title="Antrenori — medalii de aur" noBodyPadding>
						{topCoaches.length === 0 ? (
							<div className="px-5 py-6 text-[12.5px] text-slate-500">
								Nicio medalie de aur înregistrată încă.
							</div>
						) : (
							topCoaches.map((c, i) => {
								const name = formatFullName(
									c.firstName,
									c.lastName,
									c.email,
								);
								return (
									<div
										key={c.id}
										className={`flex items-center gap-2.5 px-5 py-2.5 transition-colors duration-200 hover:bg-surface-subtle ${i > 0 ? "border-t border-border-soft" : ""}`}
									>
										<div className="w-6 text-center text-[11px] font-bold text-slate-500 flex-shrink-0">
											{i + 1}
										</div>
										<div className="w-7 h-7 rounded-[7px] bg-blue-50 text-blue-800 grid place-items-center font-bold text-[10.5px] flex-shrink-0">
											{initials(name)}
										</div>
										<div className="min-w-0 flex-1 text-[12.5px] font-semibold text-ink-800 truncate">
											{name}
										</div>
										<div className="text-[11px] font-bold text-gold flex-shrink-0">
											{c.medals} aur
										</div>
									</div>
								);
							})
						)}
					</Panel>
				</div>
			</div>
		</div>
	);
}
