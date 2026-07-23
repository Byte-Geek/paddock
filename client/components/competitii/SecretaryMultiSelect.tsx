"use client";

import { useEffect, useRef, useState } from "react";
import { EventSecretary } from "@/types";
import { formatFullName } from "@/lib/utils";

interface SecretaryMultiSelectProps {
	options: EventSecretary[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
}

function label(s: EventSecretary): string {
	return formatFullName(s.firstName, s.lastName, s.email);
}

export default function SecretaryMultiSelect({
	options,
	selectedIds,
	onChange,
}: SecretaryMultiSelectProps) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selected = options.filter((o) => selectedIds.includes(o.id));
	const filtered = options.filter(
		(o) =>
			!selectedIds.includes(o.id) &&
			label(o).toLowerCase().includes(query.toLowerCase()),
	);

	const addSecretary = (id: string) => {
		onChange([...selectedIds, id]);
		setQuery("");
	};

	const removeSecretary = (id: string) => {
		onChange(selectedIds.filter((s) => s !== id));
	};

	return (
		<div ref={containerRef} className="relative">
			<div
				className="flex flex-wrap items-center gap-1.5 border border-[var(--color-border)] rounded-lg px-2 py-1.5 min-h-[38px] focus-within:border-[var(--color-blue-600)] cursor-text"
				onClick={() => setOpen(true)}
			>
				{selected.map((s) => (
					<span
						key={s.id}
						className="flex items-center gap-1 bg-[var(--color-blue-50)] text-[var(--color-blue-600)] text-xs font-medium px-2 py-1 rounded-md"
					>
						{label(s)}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								removeSecretary(s.id);
							}}
							className="text-[var(--color-blue-600)] hover:text-[var(--color-blue-800)]"
						>
							×
						</button>
					</span>
				))}
				<input
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder={
						selected.length === 0 ? "Caută secretar..." : ""
					}
					className="flex-1 min-w-[80px] text-sm outline-none py-0.5"
				/>
			</div>

			{open && (
				<div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg bg-surface shadow-lg">
					{filtered.length === 0 ? (
						<p className="px-3 py-2 text-xs text-[var(--color-slate-500)]">
							{options.length === 0
								? "Niciun utilizator moderator disponibil."
								: "Niciun rezultat."}
						</p>
					) : (
						filtered.map((o) => (
							<button
								type="button"
								key={o.id}
								onClick={() => addSecretary(o.id)}
								className="w-full text-left px-3 py-2 text-sm text-[var(--color-blue-900)] hover:bg-[var(--color-surface-subtle)] transition"
							>
								{label(o)}
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
}
