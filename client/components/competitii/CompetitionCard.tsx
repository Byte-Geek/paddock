"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CompetitionEvent, EventStatus } from "@/types";
import {
	EVENT_STATUS_LABELS,
	EVENT_STATUS_VARIANTS,
} from "@/lib/constants/event-status";

const STATUS_BAR: Record<EventStatus, string> = {
	DRAFT: "bg-[var(--color-slate-300)]",
	PUBLISHED: "bg-[var(--color-blue-600)]",
	ONGOING: "bg-amber-400",
	COMPLETED: "bg-emerald-500",
};

export default function CompetitionCard({
	competition: c,
	canManage,
}: {
	competition: CompetitionEvent;
	canManage: boolean;
}) {
	const router = useRouter();
	const { day, month, year } = formatDate(c.startDate);
	const href = canManage
		? `/competitii/${c.id}`
		: `/competitii/${c.id}/vizualizare`;

	return (
		<div
			onClick={() => router.push(href)}
			className="flex bg-surface rounded-md border border-[var(--color-border)] overflow-hidden cursor-pointer hover:shadow-[var(--shadow-panel-hover)] hover:-translate-y-0.5 transition-all duration-300"
		>
			<div
				className={`w-[3px] flex-shrink-0 ${STATUS_BAR[c.status] ?? "bg-[var(--color-slate-300)]"}`}
			/>
			<div className="flex-1 p-5">
				<div className="flex justify-between items-start gap-3">
					<div className="flex-1">
						<div className="flex gap-2 items-center mb-2">
							<Badge variant={EVENT_STATUS_VARIANTS[c.status] ?? "gray"}>
								{EVENT_STATUS_LABELS[c.status] ?? c.status}
							</Badge>
						</div>
						<div className="font-bold text-[16px] text-[var(--color-blue-900)] tracking-[-0.01em]">
							{c.name}
						</div>
						{c.description && (
							<div className="text-[13px] text-[var(--color-ink-700)] mt-1.5">
								{c.description}
							</div>
						)}
					</div>

					<div className="flex-shrink-0 w-[86px] text-center px-1 py-2 bg-[var(--color-blue-50)] rounded-md border border-[var(--color-blue-100)]">
						<div className="text-[10px] font-bold text-[var(--color-blue-800)] tracking-[0.08em] uppercase">
							{month}
						</div>
						<div className="font-mono font-bold text-[22px] text-[var(--color-ink-900)] leading-none tabular-nums">
							{day}
						</div>
						<div className="text-[10px] text-[var(--color-slate-500)] mt-[2px]">
							{year}
						</div>
					</div>
				</div>

				<div className="flex gap-4 mt-4 pt-4 border-t border-[var(--color-border-soft)] text-[12px] text-[var(--color-slate-500)] items-center">
				{c.location && (
					<span className="flex items-center gap-1.5">
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						{c.location}
					</span>
				)}
				<span className="flex items-center gap-1.5">
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
					{c.participantCount} participanți
				</span>
				<Link
					href={href}
					className="ml-auto text-xs text-[var(--color-blue-600)] border border-[var(--color-blue-300)] px-2.5 py-1 rounded-[6px] hover:bg-[var(--color-blue-50)] transition"
				>
					{canManage ? "⚙️ Gestionează" : "👁️ Vizualizează"}
				</Link>
				</div>
			</div>
		</div>
	);
}
