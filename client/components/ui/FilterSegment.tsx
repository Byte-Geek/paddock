"use client";

interface Option {
	key: string;
	label: string;
}

interface FilterSegmentProps {
	options: Option[];
	active: string;
	onChange: (key: string) => void;
}

export default function FilterSegment({
	options,
	active,
	onChange,
}: FilterSegmentProps) {
	return (
		<div className="flex bg-surface border border-[var(--color-border-soft)] rounded-lg overflow-hidden">
			{options.map((opt) => (
				<button
					key={opt.key}
					onClick={() => onChange(opt.key)}
					className={`px-4 py-2 text-sm font-medium transition ${
						active === opt.key
							? "bg-[var(--color-blue-600)] text-white"
							: "text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)]"
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}
