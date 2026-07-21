import { ParticipationHistoryEntry } from "@/types";

const medalIcons: Record<number, string> = {
	1: "🥇",
	2: "🥈",
	3: "🥉",
};

export default function ParticipationHistoryTable({
	history,
}: {
	history: ParticipationHistoryEntry[];
}) {
	if (history.length === 0) {
		return (
			<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
				Nicio participare înregistrată încă.
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-[#e8ecf5] overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-[#f4f6fb]">
					<tr>
						{["Loc", "Competiție", "Categorie", "Cal", "Punctaj", "Data"].map(
							(h) => (
								<th
									key={h}
									className="text-left px-5 py-3 text-xs font-semibold text-[#8896b3] uppercase tracking-wide"
								>
									{h}
								</th>
							),
						)}
					</tr>
				</thead>
				<tbody>
					{history.map((h, i) => (
						<tr
							key={h.id}
							className={`border-t border-[#e8ecf5] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}`}
						>
							<td className="px-5 py-3">
								{h.rank ? (
									<span className="font-semibold text-[#0f1729]">
										{medalIcons[h.rank] ?? ""} {h.rank}
									</span>
								) : (
									<span className="text-[#b0bcd4]">—</span>
								)}
							</td>
							<td className="px-5 py-3 font-semibold text-[#0f1729]">
								{h.eventName}
							</td>
							<td className="px-5 py-3 text-[#8896b3] text-xs">
								{h.categoryName}
							</td>
							<td className="px-5 py-3 text-[#8896b3] text-xs">
								{h.horseName ?? "—"}
							</td>
							<td className="px-5 py-3 text-[#0f1729]">
								{h.finalScore ?? "—"}
							</td>
							<td className="px-5 py-3 text-[#8896b3] text-xs">
								{h.eventDate
									? new Date(h.eventDate).toLocaleDateString(
											"ro-RO",
										)
									: "—"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
