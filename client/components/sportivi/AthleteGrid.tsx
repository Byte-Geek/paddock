import { Athlete } from "@/types";
import { initials } from "@/lib/utils";

interface AthleteGridProps {
	athletes: Athlete[];
	onEdit?: (athlete: Athlete) => void;
	onDelete?: (athlete: Athlete) => void;
}

export default function AthleteGrid({
	athletes,
	onEdit,
	onDelete,
}: AthleteGridProps) {
	if (athletes.length === 0) {
		return (
			<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
				Niciun sportiv găsit.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-4">
			{athletes.map((a) => {
				const name =
					`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() ||
					a.email;
				return (
					<div
						key={a.id}
						className="bg-white rounded-xl border border-[#e8ecf5] p-5 flex flex-col items-center text-center gap-3"
					>
						<div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b5d7f1] to-[#e0eef9] text-[#143654] grid place-items-center font-bold text-base flex-shrink-0">
							{initials(name)}
						</div>
						<div>
							<div className="font-bold text-[#0f1729] text-sm">
								{name}
							</div>
							<div className="text-xs text-[#8896b3] mt-0.5">
								{a.email}
							</div>
						</div>
						<div className="flex gap-1.5 flex-wrap justify-center">
							{a.groups.length === 0 ? (
								<span className="text-xs text-[#b0bcd4]">
									Nicio grupă
								</span>
							) : (
								a.groups.map((g) => (
									<span
										key={g.id}
										className="text-[11px] font-medium bg-[#f1f7fc] text-[#205280] px-2 py-1 rounded-md"
									>
										{g.name}
									</span>
								))
							)}
						</div>
						{(onEdit || onDelete) && (
							<div className="flex gap-2 pt-2 border-t border-[#e8ecf5] w-full justify-center">
								{onEdit && (
									<button
										onClick={() => onEdit(a)}
										className="text-xs text-[#8896b3] hover:text-[#4a7adb] transition"
									>
										✏️ Editează
									</button>
								)}
								{onDelete && (
									<button
										onClick={() => onDelete(a)}
										className="text-xs text-[#8896b3] hover:text-red-500 transition"
									>
										🗑️ Șterge
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
