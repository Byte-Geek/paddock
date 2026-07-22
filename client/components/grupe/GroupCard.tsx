import { Group } from "@/types";
import { initials, formatFullName } from "@/lib/utils";

interface GroupCardProps {
	group: Group;
	onDetails: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

export default function GroupCard({
	group,
	onDetails,
	onEdit,
	onDelete,
}: GroupCardProps) {
	const coachName = formatFullName(
		group.coach.firstName,
		group.coach.lastName,
		group.coach.email,
	);

	return (
		<div className="bg-white rounded-xl border border-[#e8ecf5] p-5 flex flex-col gap-3">
			<div className="flex items-start gap-3">
				<div className="flex-1 min-w-0">
					<div className="font-bold text-[#0f1729] text-sm truncate">
						{group.name}
					</div>
					{group.description && (
						<div className="text-xs text-[#8896b3] mt-0.5 line-clamp-2">
							{group.description}
						</div>
					)}
				</div>
				<div className="flex items-center gap-2 flex-shrink-0">
					<div className="bg-[#4a7adb] text-white text-xs font-bold px-2.5 py-1 rounded-full">
						{group.athleteCount}
					</div>
					{onEdit && (
						<button
							onClick={onEdit}
							title="Editează"
							className="p-1.5 rounded-lg hover:bg-[#f4f6fb] text-[#8896b3] hover:text-[#0f1729] transition text-xs"
						>
							✏️
						</button>
					)}
					{onDelete && (
						<button
							onClick={onDelete}
							title="Șterge"
							className="p-1.5 rounded-lg hover:bg-red-50 text-[#8896b3] hover:text-red-500 transition text-xs"
						>
							🗑️
						</button>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between pt-3 border-t border-[#e8ecf5]">
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#b5d7f1] to-[#e0eef9] text-[#143654] grid place-items-center font-bold text-[10px] flex-shrink-0">
						{initials(coachName)}
					</div>
					<span className="text-xs text-[#8896b3]">
						{coachName}
					</span>
				</div>
				<button
					onClick={onDetails}
					className="text-xs text-[#4a7adb] hover:underline flex items-center gap-1"
				>
					👁 Detalii
				</button>
			</div>
		</div>
	);
}
