import { Coach } from "@/types";
import { initials, formatFullName } from "@/lib/utils";

interface CoachCardProps {
	coach: Coach;
	onEdit?: (coach: Coach) => void;
	onDelete?: (coach: Coach) => void;
}

export default function CoachCard({ coach, onEdit, onDelete }: CoachCardProps) {
	const fullName = formatFullName(coach.firstName, coach.lastName, coach.email);

	return (
		<div className="bg-white rounded-xl border border-[#e8ecf5] p-5 flex flex-col gap-3">
			<div className="flex items-start gap-3">
				<div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#b5d7f1] to-[#e0eef9] text-[#143654] grid place-items-center font-bold text-sm flex-shrink-0">
					{initials(fullName)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="font-semibold text-sm text-[#0f1729] truncate">
						{fullName}
					</div>
					<div className="text-xs text-[#8896b3] truncate">
						{coach.email}
					</div>
				</div>
				{(onEdit || onDelete) && (
					<div className="flex gap-1 flex-shrink-0">
						{onEdit && (
							<button
								onClick={() => onEdit(coach)}
								title="Editează"
								className="p-1.5 rounded-lg hover:bg-[#f4f6fb] text-[#8896b3] hover:text-[#0f1729] transition text-xs"
							>
								✏️
							</button>
						)}
						{onDelete && (
							<button
								onClick={() => onDelete(coach)}
								title="Șterge"
								className="p-1.5 rounded-lg hover:bg-red-50 text-[#8896b3] hover:text-red-500 transition text-xs"
							>
								🗑️
							</button>
						)}
					</div>
				)}
			</div>

			<div className="border-t border-[#eef2f7] pt-3">
				<div className="text-[10px] uppercase tracking-[0.08em] text-[#b0bcd4] font-semibold mb-1.5">
					Grupe
				</div>
				{coach.groups.length === 0 ? (
					<div className="text-xs text-[#b0bcd4]">
						Nicio grupă asociată
					</div>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{coach.groups.map((g) => (
							<span
								key={g.id}
								className="text-[11px] font-medium bg-[#f1f7fc] text-[#205280] px-2 py-1 rounded-md"
							>
								{g.name}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
