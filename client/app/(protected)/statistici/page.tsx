"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import api from "@/lib/axios";
import {
	AthletesPerGroup,
	EventsTimelinePoint,
	Medals,
	TopCoach,
} from "@/types";

const currentYear = new Date().getFullYear();

export default function StatisticiPage() {
	const [medals, setMedals] = useState<Medals | null>(null);
	const [timeline, setTimeline] = useState<EventsTimelinePoint[]>([]);
	const [athletesPerGroup, setAthletesPerGroup] = useState<
		AthletesPerGroup[]
	>([]);
	const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const [medalsRes, timelineRes, groupsRes, coachesRes] =
					await Promise.all([
						api.get<Medals>("/stats/medals"),
						api.get<EventsTimelinePoint[]>(
							"/stats/events-timeline",
						),
						api.get<AthletesPerGroup[]>(
							"/stats/athletes-per-group",
						),
						api.get<TopCoach[]>("/stats/top-coaches"),
					]);
				setMedals(medalsRes.data);
				setTimeline(timelineRes.data);
				setAthletesPerGroup(groupsRes.data);
				setTopCoaches(coachesRes.data);
			} catch (error) {
				console.error("Failed to load stats", error);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, []);

	return (
		<div>
			<PageHeader
				title="Statistici"
				subtitle="Indicatori de performanță și activitate"
			/>

			{loading ? (
				<div className="text-sm text-[#8896b3]">Se încarcă...</div>
			) : (
				<>
					{/* Medal stats */}
					<div className="grid grid-cols-4 gap-4 mb-6">
						<StatCard label="Aur" value={medals?.gold ?? 0} />
						<StatCard label="Argint" value={medals?.silver ?? 0} />
						<StatCard label="Bronz" value={medals?.bronze ?? 0} />
						<StatCard
							label="Total participări"
							value={medals?.totalParticipations ?? 0}
						/>
					</div>

					{/* Charts row 1 */}
					<div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
						<div className="bg-white rounded-[10px] border border-[#e2e8f0]">
							<div className="flex items-center justify-between px-5 py-4 border-b border-[#eef2f7]">
								<h3 className="font-semibold text-[#0e1f33]">
									Evenimente pe lună
								</h3>
								<div className="flex items-center gap-4 text-xs text-[#6b7d92]">
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-0.5 bg-[#2a6aa6] inline-block rounded" />{" "}
										{currentYear}
									</span>
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-0.5 bg-[#6cb0e6] inline-block rounded border-dashed border-b" />{" "}
										{currentYear - 1}
									</span>
								</div>
							</div>
							<div className="p-4">
								<LineChart
									series={timeline.map((t) => ({
										month: t.month,
										a: t.currentYear,
										b: t.previousYear,
									}))}
								/>
							</div>
						</div>

						<div className="bg-white rounded-[10px] border border-[#e2e8f0]">
							<div className="px-5 py-4 border-b border-[#eef2f7]">
								<h3 className="font-semibold text-[#0e1f33]">
									Distribuție medalii
								</h3>
							</div>
							<div className="p-5 flex items-center justify-center">
								<DonutChart
									data={[
										{
											label: "Aur",
											value: medals?.gold ?? 0,
											color: "#f59e0b",
										},
										{
											label: "Argint",
											value: medals?.silver ?? 0,
											color: "#94a3b8",
										},
										{
											label: "Bronz",
											value: medals?.bronze ?? 0,
											color: "#c2410c",
										},
									]}
								/>
							</div>
						</div>
					</div>

					{/* Charts row 2 */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-white rounded-[10px] border border-[#e2e8f0]">
							<div className="px-5 py-4 border-b border-[#eef2f7]">
								<h3 className="font-semibold text-[#0e1f33]">
									Sportivi per grupă
								</h3>
							</div>
							<div className="p-5">
								{athletesPerGroup.length === 0 ? (
									<div className="text-sm text-[#8896b3]">
										Nicio grupă cu sportivi.
									</div>
								) : (
									<BarChart
										data={athletesPerGroup.map((g) => ({
											label: g.name,
											value: g.value,
											color: "#2a6aa6",
										}))}
									/>
								)}
							</div>
						</div>

						<div className="bg-white rounded-[10px] border border-[#e2e8f0]">
							<div className="px-5 py-4 border-b border-[#eef2f7]">
								<h3 className="font-semibold text-[#0e1f33]">
									Top antrenori · medalii de aur
								</h3>
							</div>
							<div className="py-2">
								{topCoaches.length === 0 && (
									<div className="px-5 py-6 text-sm text-[#8896b3]">
										Nicio medalie înregistrată încă.
									</div>
								)}
								{topCoaches.map((c) => {
									const name =
										`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
										c.email;
									const w =
										(c.medals /
											Math.max(
												...topCoaches.map(
													(x) => x.medals,
												),
												1,
											)) *
										100;
									return (
										<div
											key={c.id}
											className="flex items-center gap-3 px-5 py-2.5"
										>
											<div className="w-7 h-7 rounded-full bg-[#e0eef9] text-[#205280] grid place-items-center text-xs font-bold flex-shrink-0">
												{name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-[13px] font-semibold text-[#0e1f33] truncate">
													{name}
												</div>
												<div className="mt-1.5 h-1.5 bg-[#e0eef9] rounded-full overflow-hidden">
													<div
														className="h-full bg-[#2a6aa6] rounded-full transition-all"
														style={{
															width: `${w}%`,
														}}
													/>
												</div>
											</div>
											<div className="font-bold text-[13px] text-[#0e1f33]">
												{c.medals}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
