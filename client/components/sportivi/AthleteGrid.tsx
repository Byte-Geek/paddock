import { Athlete } from "@/types";
import { initials, formatFullName } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

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
		return <EmptyState>Niciun sportiv găsit.</EmptyState>;
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{athletes.map((a) => {
				const name = formatFullName(a.firstName, a.lastName, a.email);
				return (
					<div
						key={a.id}
						className="bg-surface rounded-md border border-[var(--color-border-soft)] p-5 flex flex-col items-center text-center gap-3"
					>
						<div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-blue-300)] to-[var(--color-blue-100)] text-[var(--color-ink-900)] grid place-items-center font-bold text-base flex-shrink-0">
							{initials(name)}
						</div>
						<div>
							<div className="font-bold text-[var(--color-ink-800)] text-sm">
								{name}
							</div>
							<div className="text-xs text-[var(--color-slate-500)] mt-0.5">
								{a.email}
							</div>
						</div>
						<div className="flex gap-1.5 flex-wrap justify-center">
							{a.groups.length === 0 ? (
								<span className="text-xs text-[var(--color-slate-400)]">
									Nicio grupă
								</span>
							) : (
								a.groups.map((g) => (
									<span
										key={g.id}
										className="text-[11px] font-medium bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
									>
										{g.name}
									</span>
								))
							)}
						</div>
						{(onEdit || onDelete) && (
							<div className="flex gap-2 pt-2 border-t border-[var(--color-border-soft)] w-full justify-center">
								{onEdit && (
									<button
										onClick={() => onEdit(a)}
										className="text-xs text-[var(--color-slate-500)] hover:text-[var(--color-blue-600)] transition"
									>
										✏️ Editează
									</button>
								)}
								{onDelete && (
									<button
										onClick={() => onDelete(a)}
										className="text-xs text-[var(--color-slate-500)] hover:text-red-500 transition"
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
