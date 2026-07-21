"use client";

import { useEffect, useState } from "react";
import Modal, { ModalHeader, ModalBody } from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import api from "@/lib/axios";
import { CompetitionEvent, CompetitionEventDetail } from "@/types";

const medalColors = [
	"bg-amber-100 text-amber-800",
	"bg-slate-100 text-slate-600",
	"bg-orange-100 text-orange-800",
];

export default function CompetitionModal({
	competition: c,
	onClose,
}: {
	competition: CompetitionEvent;
	onClose: () => void;
}) {
	const [detail, setDetail] = useState<CompetitionEventDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDetail = async () => {
			try {
				const { data } = await api.get<CompetitionEventDetail>(
					`/events/${c.id}`,
				);
				setDetail(data);
			} catch (error) {
				console.error("Failed to load event detail", error);
			} finally {
				setLoading(false);
			}
		};

		loadDetail();
	}, [c.id]);

	const allParticipations = (detail?.categories ?? []).flatMap((cat) =>
		cat.participations.map((p) => ({ ...p, categoryName: cat.name })),
	);

	return (
		<Modal onClose={onClose} wide>
			<ModalHeader
				title={c.name}
				subtitle={[c.location, c.startDate ? new Date(c.startDate).toLocaleDateString("ro-RO") : null]
					.filter(Boolean)
					.join(" · ")}
				onClose={onClose}
			/>
			<ModalBody noPadding>
				<div className="overflow-auto max-h-[500px]">
					{loading ? (
						<div className="p-10 text-center text-sm text-[#6b7d92]">
							Se încarcă...
						</div>
					) : allParticipations.length === 0 ? (
						<div className="p-10 text-center text-sm text-[#6b7d92]">
							Nicio categorie sau participare înregistrată încă
							pentru acest eveniment.
						</div>
					) : (
						<table className="w-full text-sm">
							<thead className="bg-[#f1f7fc] sticky top-0">
								<tr>
									{[
										"Loc",
										"Sportiv",
										"Categorie",
										"Cal",
										"Punctaj",
									].map((h) => (
										<th
											key={h}
											className="text-left px-5 py-3 text-xs font-semibold text-[#6b7d92] uppercase tracking-wide"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{allParticipations.map((p, i) => (
									<tr
										key={p.id}
										className={`border-t border-[#eef2f7] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}`}
									>
										<td className="px-5 py-3">
											{p.rank && p.rank <= 3 ? (
												<span
													className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${medalColors[p.rank - 1]}`}
												>
													{p.rank}
												</span>
											) : (
												<span className="text-[#6b7d92] font-semibold">
													{p.rank ?? "—"}
												</span>
											)}
										</td>
										<td className="px-5 py-3">
											<div className="flex items-center gap-2">
												<Avatar
													name={p.athleteName}
													size="sm"
												/>
												<span className="font-semibold text-[#0e1f33]">
													{p.athleteName}
												</span>
											</div>
										</td>
										<td className="px-5 py-3 text-[#6b7d92] text-xs">
											{p.categoryName}
										</td>
										<td className="px-5 py-3 text-[#6b7d92] text-xs">
											{p.horseName ?? "—"}
										</td>
										<td className="px-5 py-3 font-semibold text-[#0e1f33]">
											{p.finalScore ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</ModalBody>
		</Modal>
	);
}
