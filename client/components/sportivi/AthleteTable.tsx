import { Athlete } from "@/types";
import { initials } from "@/lib/utils";

interface AthleteTableProps {
	athletes: Athlete[];
	onEdit: (athlete: Athlete) => void;
	onDelete: (athlete: Athlete) => void;
}

export default function AthleteTable({
	athletes,
	onEdit,
	onDelete,
}: AthleteTableProps) {
	return (
		<div className="bg-white rounded-xl border border-[#e8ecf5] overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-[#f4f6fb]">
					<tr>
						{["Sportiv", "Grupe", ""].map((h) => (
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
					{athletes.map((a, i) => {
						const name =
							`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() ||
							a.email;
						return (
							<tr
								key={a.id}
								className={`border-t border-[#e8ecf5] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"} hover:bg-[#f4f6fb] transition`}
							>
								<td className="px-5 py-3">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b5d7f1] to-[#e0eef9] text-[#143654] grid place-items-center font-bold text-xs flex-shrink-0">
											{initials(name)}
										</div>
										<div>
											<div className="font-semibold text-[#0f1729]">
												{name}
											</div>
											<div className="text-xs text-[#b0bcd4]">
												{a.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-5 py-3">
									{a.groups.length === 0 ? (
										<span className="text-xs text-[#b0bcd4]">
											—
										</span>
									) : (
										<div className="flex flex-wrap gap-1.5">
											{a.groups.map((g) => (
												<span
													key={g.id}
													className="text-[11px] font-medium bg-[#f1f7fc] text-[#205280] px-2 py-1 rounded-md"
												>
													{g.name}
												</span>
											))}
										</div>
									)}
								</td>
								<td className="px-5 py-3 text-right whitespace-nowrap">
									<button
										onClick={() => onEdit(a)}
										title="Editează"
										className="text-xs text-[#8896b3] hover:text-[#4a7adb] transition p-1"
									>
										✏️
									</button>
									<button
										onClick={() => onDelete(a)}
										title="Șterge"
										className="text-xs text-[#8896b3] hover:text-red-500 transition p-1"
									>
										🗑️
									</button>
								</td>
							</tr>
						);
					})}
					{athletes.length === 0 && (
						<tr>
							<td
								colSpan={3}
								className="px-5 py-10 text-center text-[#b0bcd4] text-sm"
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
