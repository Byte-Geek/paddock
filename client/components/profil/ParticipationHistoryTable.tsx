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
			<div className="rounded-md border border-[var(--color-border-soft)] bg-surface p-6 text-sm text-[var(--color-slate-500)]">
				Nicio participare înregistrată încă.
			</div>
		);
	}

	return (
		<div className="bg-surface rounded-md border border-[var(--color-border-soft)] overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-[var(--color-silver-bg)]">
					<tr>
						{["Loc", "Competiție", "Categorie", "Cal", "Punctaj", "Data"].map(
							(h) => (
								<th
									key={h}
									className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide"
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
							className={`border-t border-[var(--color-border-soft)] ${i % 2 === 0 ? "bg-surface" : "bg-[var(--color-surface-subtle)]"}`}
						>
							<td className="px-5 py-3">
								{h.rank ? (
									<span className="font-semibold text-[var(--color-ink-800)]">
										{medalIcons[h.rank] ?? ""} {h.rank}
									</span>
								) : (
									<span className="text-[var(--color-slate-400)]">—</span>
								)}
							</td>
							<td className="px-5 py-3 font-semibold text-[var(--color-ink-800)]">
								{h.eventName}
							</td>
							<td className="px-5 py-3 text-[var(--color-slate-500)] text-xs">
								{h.categoryName}
							</td>
							<td className="px-5 py-3 text-[var(--color-slate-500)] text-xs">
								{h.horseName ?? "—"}
							</td>
							<td className="px-5 py-3 text-[var(--color-ink-800)]">
								{h.finalScore ?? "—"}
							</td>
							<td className="px-5 py-3 text-[var(--color-slate-500)] text-xs">
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
