"use client";

import { useAuthStore } from "@/store/auth.store";
import StatCard from "@/components/ui/StatCard";

const MONTHS = [
	"IAN",
	"FEB",
	"MAR",
	"APR",
	"MAI",
	"IUN",
	"IUL",
	"AUG",
	"SEP",
	"OCT",
	"NOI",
	"DEC",
];

const stats = [
	{ label: "Sportivi activi", value: 46, delta: "+4 luna asta", icon: "🏃" },
	{ label: "Antrenori", value: 5, delta: "+1", icon: "👤" },
	{
		label: "Grupe",
		value: 7,
		delta: "stabil",
		deltaPositive: false,
		icon: "👥",
	},
	{ label: "Competiții 2026", value: 12, delta: "3 viitoare", icon: "🏆" },
];

const announcements = [
	{
		id: 1,
		title: "Cantonament național hipism",
		body: "Cantonamentul se va desfășura în perioada 10-15 iunie la Baza Sportivă Vatra.",
		date: "22 mai 2026",
	},
	{
		id: 2,
		title: "Rezultate Cupa Moldovei",
		body: "Felicităm sportivii care au obținut locuri fruntașe la Cupa Moldovei 2026.",
		date: "18 mai 2026",
	},
	{
		id: 3,
		title: "Program antrenamente mai",
		body: "Programul actualizat pentru luna mai este disponibil în secțiunea Grupe.",
		date: "01 mai 2026",
	},
];

const events = [
	{
		id: 1,
		date: "2026-06-10",
		title: "Cantonament Hipism",
		type: "Cantonament",
	},
	{
		id: 2,
		date: "2026-06-22",
		title: "Cupa României - PMD",
		type: "Competiție internațională",
	},
	{
		id: 3,
		date: "2026-07-05",
		title: "Campionatul Național",
		type: "Competiție națională",
	},
];

export default function MainPage() {
	const user = useAuthStore((s) => s.user);
	const firstName = user?.name?.split(" ")[0];

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
			<div className="grid grid-cols-4 gap-4">
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

			{/* Anunțuri + Evenimente */}
			<div className="grid grid-cols-[1.4fr_1fr] gap-4">
				<div className="bg-white rounded-xl border border-[#e8ecf5]">
					<div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf5]">
						<h3 className="font-semibold text-[#0f1729]">
							Anunțuri recente
						</h3>
						<button className="text-xs text-[#4a7adb] hover:underline">
							Vezi toate
						</button>
					</div>
					{announcements.map((a, i) => (
						<div
							key={a.id}
							className={`flex gap-4 px-5 py-4 ${i > 0 ? "border-t border-[#e8ecf5]" : ""}`}
						>
							<div className="w-1.5 rounded-full bg-[#4a7adb] self-stretch flex-shrink-0" />
							<div>
								<div className="font-semibold text-sm text-[#0f1729]">
									{a.title}
								</div>
								<div className="text-xs text-[#8896b3] mt-1">
									{a.body}
								</div>
								<div className="text-xs text-[#b0bcd4] mt-1.5">
									{a.date}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="bg-white rounded-xl border border-[#e8ecf5]">
					<div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ecf5]">
						<h3 className="font-semibold text-[#0f1729]">
							Evenimente apropiate
						</h3>
						<button className="text-xs text-[#4a7adb] hover:underline">
							Calendar
						</button>
					</div>
					{events.map((e, i) => {
						const { day, month } = {
							day: e.date.split("-")[2],
							month: MONTHS[parseInt(e.date.split("-")[1]) - 1],
						};
						return (
							<div
								key={e.id}
								className={`flex gap-4 items-center px-5 py-4 ${i > 0 ? "border-t border-[#e8ecf5]" : ""}`}
							>
								<div className="w-12 text-center flex-shrink-0">
									<div className="text-[10px] font-bold text-[#4a7adb] tracking-widest">
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
									<div className="text-xs text-[#8896b3] mt-0.5">
										{e.type}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
