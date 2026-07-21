"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CoachProfileStats } from "@/types";
import MedalsSummary from "@/components/profil/MedalsSummary";
import ParticipationHistoryTable from "@/components/profil/ParticipationHistoryTable";

export default function CoachProfileView() {
	const [stats, setStats] = useState<CoachProfileStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<CoachProfileStats>(
					"/profile/coach",
				);
				setStats(data);
			} catch (error) {
				console.error("Failed to load coach profile stats", error);
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
			{stats.ownParticipation && (
				<div>
					<h3 className="font-semibold text-[#0f1729] mb-3">
						Rezultatele mele ca sportiv
					</h3>
					<div className="flex flex-col gap-4">
						<MedalsSummary medals={stats.ownParticipation.medals} />
						<ParticipationHistoryTable
							history={stats.ownParticipation.history}
						/>
					</div>
				</div>
			)}

			<div>
				<h3 className="font-semibold text-[#0f1729] mb-3">
					Statistici generale — grupele mele
				</h3>
				<div className="grid grid-cols-3 gap-4 mb-4">
					<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
						<div className="text-xl font-bold text-[#0f1729]">
							{stats.groups.length}
						</div>
						<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
							Grupe
						</div>
					</div>
					<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
						<div className="text-xl font-bold text-[#0f1729]">
							{stats.overall.totalAthletes}
						</div>
						<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
							Sportivi
						</div>
					</div>
					<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
						<div className="text-xl font-bold text-[#0f1729]">
							{stats.overall.totalParticipations}
						</div>
						<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
							Participări
						</div>
					</div>
				</div>
				<MedalsSummary
					medals={stats.overall.medals}
					label="Participări"
				/>
			</div>

			<div>
				<h3 className="font-semibold text-[#0f1729] mb-3">
					Statistici pe grupe
				</h3>
				{stats.groups.length === 0 ? (
					<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
						Nu ai nicio grupă asociată.
					</div>
				) : (
					<div className="bg-white rounded-xl border border-[#e8ecf5] overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-[#f4f6fb]">
								<tr>
									{[
										"Grupă",
										"Sportivi",
										"🥇",
										"🥈",
										"🥉",
										"Total participări",
									].map((h) => (
										<th
											key={h}
											className="text-left px-5 py-3 text-xs font-semibold text-[#8896b3] uppercase tracking-wide"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{stats.groups.map((g, i) => (
									<tr
										key={g.id}
										className={`border-t border-[#e8ecf5] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}`}
									>
										<td className="px-5 py-3 font-semibold text-[#0f1729]">
											{g.name}
										</td>
										<td className="px-5 py-3 text-[#8896b3]">
											{g.athleteCount}
										</td>
										<td className="px-5 py-3 text-[#0f1729]">
											{g.medals.gold}
										</td>
										<td className="px-5 py-3 text-[#0f1729]">
											{g.medals.silver}
										</td>
										<td className="px-5 py-3 text-[#0f1729]">
											{g.medals.bronze}
										</td>
										<td className="px-5 py-3 text-[#0f1729]">
											{g.medals.total}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
