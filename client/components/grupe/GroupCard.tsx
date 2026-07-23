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
		<div
			onClick={onDetails}
			className="bg-surface rounded-md border border-[var(--color-border-soft)] p-5 flex flex-col gap-3 cursor-pointer hover:shadow-[var(--shadow-panel-hover)] hover:-translate-y-0.5 transition-all duration-300"
		>
			<div className="flex items-start gap-3">
				<div className="flex-1 min-w-0">
					<div className="font-bold text-[var(--color-ink-800)] text-sm truncate">
						{group.name}
					</div>
					{group.description && (
						<div className="text-xs text-[var(--color-slate-500)] mt-0.5 line-clamp-2">
							{group.description}
						</div>
					)}
				</div>
				<div
					className="flex items-center gap-2 flex-shrink-0"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="bg-[var(--color-blue-600)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
						{group.athleteCount}
					</div>
					{onEdit && (
						<button
							onClick={onEdit}
							title="Editează"
							className="p-1.5 rounded-lg hover:bg-[var(--color-silver-bg)] text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)] transition text-xs"
						>
							✏️
						</button>
					)}
					{onDelete && (
						<button
							onClick={onDelete}
							title="Șterge"
							className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate-500)] hover:text-red-500 transition text-xs"
						>
							🗑️
						</button>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-soft)]">
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-blue-300)] to-[var(--color-blue-100)] text-[var(--color-ink-900)] grid place-items-center font-bold text-[10px] flex-shrink-0">
						{initials(coachName)}
					</div>
					<span className="text-xs text-[var(--color-slate-500)]">
						{coachName}
					</span>
				</div>
				<span className="text-xs text-[var(--color-blue-600)] flex items-center gap-1">
					👁 Detalii
				</span>
			</div>
		</div>
	);
}
