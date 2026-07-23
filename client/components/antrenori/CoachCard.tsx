"use client";

import { useRouter } from "next/navigation";
import { Coach } from "@/types";
import { initials, formatFullName } from "@/lib/utils";

interface CoachCardProps {
	coach: Coach;
	onEdit?: (coach: Coach) => void;
	onDelete?: (coach: Coach) => void;
}

export default function CoachCard({ coach, onEdit, onDelete }: CoachCardProps) {
	const router = useRouter();
	const fullName = formatFullName(coach.firstName, coach.lastName, coach.email);

	return (
		<div
			onClick={() => router.push(`/antrenori/${coach.id}`)}
			className="bg-surface rounded-md border border-[var(--color-border-soft)] p-5 flex flex-col gap-3 cursor-pointer hover:shadow-[var(--shadow-panel-hover)] hover:-translate-y-0.5 transition-all duration-300"
		>
			<div className="flex items-start gap-3">
				<div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-blue-300)] to-[var(--color-blue-100)] text-[var(--color-ink-900)] grid place-items-center font-bold text-sm flex-shrink-0">
					{initials(fullName)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="font-semibold text-sm text-[var(--color-ink-800)] truncate">
						{fullName}
					</div>
					<div className="text-xs text-[var(--color-slate-500)] truncate">
						{coach.email}
					</div>
				</div>
				{(onEdit || onDelete) && (
					<div
						className="flex gap-1 flex-shrink-0"
						onClick={(e) => e.stopPropagation()}
					>
						{onEdit && (
							<button
								onClick={() => onEdit(coach)}
								title="Editează"
								className="p-1.5 rounded-lg hover:bg-[var(--color-silver-bg)] text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)] transition text-xs"
							>
								✏️
							</button>
						)}
						{onDelete && (
							<button
								onClick={() => onDelete(coach)}
								title="Șterge"
								className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate-500)] hover:text-red-500 transition text-xs"
							>
								🗑️
							</button>
						)}
					</div>
				)}
			</div>

			<div className="border-t border-[var(--color-border-soft)] pt-3">
				<div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-slate-400)] font-semibold mb-1.5">
					Grupe
				</div>
				{coach.groups.length === 0 ? (
					<div className="text-xs text-[var(--color-slate-400)]">
						Nicio grupă asociată
					</div>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{coach.groups.map((g) => (
							<span
								key={g.id}
								className="text-[11px] font-medium bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
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
