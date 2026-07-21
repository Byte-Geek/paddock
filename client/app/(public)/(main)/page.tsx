"use client";

import { useAuthStore } from "@/store/auth.store";
import StatCard from "@/components/ui/StatCard";
import { MONTHS } from "@/lib/utils";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { HomeSummary, UpcomingEvent } from "@/types";

const currentYear = new Date().getFullYear();

const defaultStats = [
	{ label: "Sportivi activi", value: 0, delta: "Se încarcă...", icon: "🏃" },
	{ label: "Antrenori", value: 0, delta: "Se încarcă...", icon: "👤" },
	{
		label: "Grupe",
		value: 0,
		delta: "Se încarcă...",
		deltaPositive: false,
		icon: "👥",
	},
	{ label: `Campionate / ${currentYear}`, value: 0, icon: "🏆" },
];

export default function MainPage() {
	const user = useAuthStore((s) => s.user);
	const firstName = user?.firstName;

	const [stats, setStats] = useState(defaultStats);
	const [events, setEvents] = useState<UpcomingEvent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadHome = async () => {
			try {
				const [summaryRes, eventsRes] = await Promise.all([
					api.get<HomeSummary>("/home/summary"),
					api.get<UpcomingEvent[]>("/home/upcoming-events"),
				]);
				const data = summaryRes.data;
				setStats([
					{
						label: "Sportivi activi",
						value: data.athletes,
						delta: "+" + data.modificationsLastMonth.athletes + " luna asta",
						icon: "🏃",
					},
					{
						label: "Antrenori",
						value: data.coaches,
						delta: "+" + data.modificationsLastMonth.coaches + " luna asta",
						icon: "👤",
					},
					{
						label: "Grupe",
						value: data.groups,
						delta: "+" + data.modificationsLastMonth.groups + " luna asta",
						icon: "👥",
					},
					{
						label: `Campionate / ${currentYear}`,
						value: data.championshipsThisYear,
						icon: "🏆",
					},
				]);
				setEvents(eventsRes.data);
			} catch (error) {
				console.error("Failed to load home data", error);
			} finally {
				setLoading(false);
			}
		};

		loadHome();
	}, []);

	return (
		<div className="flex flex-col gap-6">
			{/* Hero */}
			<div className="rounded-2xl bg-gradient-to-br from-[#1a2f5c] to-[#0f1729] p-8 flex items-center justify-between">
				<div>
					<h1 className="text-white text-3xl font-bold mb-2">
						Bună {firstName}.
					</h1>
					<p className="text-[#8896b3] text-sm max-w-md leading-relaxed">
						Platforma digitală oficială a Școlii Sportive
						Republicane de Hipism și Pentatlon Modern din Chișinău.
					</p>
					<div className="flex gap-3 mt-5">
						<button className="bg-white text-[#0f1729] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e8ecf5] transition">
							Vezi competițiile
						</button>
						<button className="border border-[#2a3a5c] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1a2744] transition">
							Calendar
						</button>
					</div>
				</div>
				<div className="opacity-20">
					<svg
						width="120"
						height="120"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="1.2"
					>
						<path d="M6 4c-2 2-3 5-3 9s2 7 3 7" />
						<path d="M18 4c2 2 3 5 3 9s-2 7-3 7" />
						<circle cx="6" cy="20" r="1.4" fill="white" />
						<circle cx="18" cy="20" r="1.4" fill="white" />
					</svg>
				</div>
			</div>

			{/* Stats */}
			<div
				className={`grid grid-cols-4 gap-4 transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}
			>
				{stats.map((s) => (
					<StatCard
						key={s.label}
						label={s.label}
						value={s.value}
						delta={s.delta}
						deltaPositive={s.deltaPositive !== false}
						icon={<span className="text-2xl">{s.icon}</span>}
					/>
				))}
			</div>

			{/* Evenimente */}
			<div className="bg-white rounded-xl border border-[#e8ecf5]">
				<div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf5]">
					<h3 className="font-semibold text-[#0f1729]">
						Evenimente apropiate
					</h3>
					<button className="text-xs text-[#4a7adb] hover:underline">
						Calendar
					</button>
				</div>
				{events.length === 0 && !loading && (
					<div className="px-5 py-6 text-sm text-[#8896b3]">
						Nu sunt evenimente programate.
					</div>
				)}
				{events.map((e, i) => {
					const startDate = new Date(e.startDate);
					const day = startDate.getDate();
					const month = MONTHS[startDate.getMonth()];
					return (
						<div
							key={e.id}
							className={`flex gap-4 items-center px-5 py-4 ${i > 0 ? "border-t border-[#e8ecf5]" : ""}`}
						>
							<div className="w-12 text-center flex-shrink-0">
								<div className="text-[10px] font-bold text-[#4a7adb] tracking-widest uppercase">
									{month}
								</div>
								<div className="text-2xl font-bold text-[#0f1729] leading-none">
									{day}
								</div>
							</div>
							<div>
								<div className="font-semibold text-sm text-[#0f1729]">
									{e.title}
								</div>
								{e.location && (
									<div className="text-xs text-[#8896b3] mt-0.5">
										{e.location}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
