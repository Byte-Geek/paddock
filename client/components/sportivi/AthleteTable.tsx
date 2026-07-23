import { Athlete } from "@/types";
import { initials, formatFullName } from "@/lib/utils";

interface AthleteTableProps {
	athletes: Athlete[];
	onEdit?: (athlete: Athlete) => void;
	onDelete?: (athlete: Athlete) => void;
}

export default function AthleteTable({
	athletes,
	onEdit,
	onDelete,
}: AthleteTableProps) {
	return (
		<div className="bg-surface rounded-md border border-[var(--color-border-soft)] overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-[var(--color-silver-bg)]">
					<tr>
						{["Sportiv", "Grupe", ""].map((h) => (
							<th
								key={h}
								className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{athletes.map((a, i) => {
						const name = formatFullName(a.firstName, a.lastName, a.email);
						return (
							<tr
								key={a.id}
								className={`border-t border-[var(--color-border-soft)] ${i % 2 === 0 ? "bg-surface" : "bg-[var(--color-surface-subtle)]"} hover:bg-[var(--color-silver-bg)] transition`}
							>
								<td className="px-5 py-3">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-blue-300)] to-[var(--color-blue-100)] text-[var(--color-ink-900)] grid place-items-center font-bold text-xs flex-shrink-0">
											{initials(name)}
										</div>
										<div>
											<div className="font-semibold text-[var(--color-ink-800)]">
												{name}
											</div>
											<div className="text-xs text-[var(--color-slate-400)]">
												{a.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-5 py-3">
									{a.groups.length === 0 ? (
										<span className="text-xs text-[var(--color-slate-400)]">
											—
										</span>
									) : (
										<div className="flex flex-wrap gap-1.5">
											{a.groups.map((g) => (
												<span
													key={g.id}
													className="text-[11px] font-medium bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
												>
													{g.name}
												</span>
											))}
										</div>
									)}
								</td>
								<td className="px-5 py-3 text-right whitespace-nowrap">
									{onEdit && (
										<button
											onClick={() => onEdit(a)}
											title="Editează"
											className="text-xs text-[var(--color-slate-500)] hover:text-[var(--color-blue-600)] transition p-1"
										>
											✏️
										</button>
									)}
									{onDelete && (
										<button
											onClick={() => onDelete(a)}
											title="Șterge"
											className="text-xs text-[var(--color-slate-500)] hover:text-red-500 transition p-1"
										>
											🗑️
										</button>
									)}
								</td>
							</tr>
						);
					})}
					{athletes.length === 0 && (
						<tr>
							<td
								colSpan={3}
								className="px-5 py-10 text-center text-[var(--color-slate-400)] text-sm"
							>
								Niciun sportiv găsit.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
