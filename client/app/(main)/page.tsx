"use client";

import { useAuthStore } from "@/store/auth.store";
import StatCard from "@/components/ui/StatCard";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { HomeSummary } from "@/types";

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
	const [loading, setLoading] = useState(true);

	useEffect(() => {	
		const loadSummary = async () => {
			try {
				const { data } = await api.get<HomeSummary>("/home/summary");
				setStats([
					{ label: "Sportivi activi", value: data.athletes, delta: "+" + data.modificationsLastMonth.athletes + " luna asta", icon: "🏃" },
					{ label: "Antrenori", value: data.coaches, delta: "+" + data.modificationsLastMonth.coaches + " luna asta", icon: "👤" },
					{ label: "Grupe", value: data.groups, delta: "+" + data.modificationsLastMonth.groups + " luna asta", icon: "👥" },
					{ label: `Campionate / ${currentYear}`, value: data.championshipsThisYear, icon: "🏆" },
				]);
			} catch (error) {
				console.error("Failed to load home summary", error);
			} finally {
				setLoading(false);
			}
		};

		loadSummary();
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

			<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
				Datele afișate sunt preluate din API-ul de home.
			</div>
		</div>
	);
}
