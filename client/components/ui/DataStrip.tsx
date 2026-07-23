import { cn } from "@/lib/utils";

export interface DataStripItem {
	key: string;
	label: string;
	value: number | string;
	icon?: React.ReactNode;
	dot?: string;
	delta?: string | null;
}

interface DataStripProps {
	items: DataStripItem[];
	className?: string;
}

export default function DataStrip({ items, className }: DataStripProps) {
	return (
		<div
			className={cn(
				"grid bg-surface border border-border rounded-lg shadow-[var(--shadow-panel)]",
				className,
			)}
			style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
		>
			{items.map((item, i) => (
				<div
					key={item.key}
					className={cn(
						"p-4 transition-colors duration-300 hover:bg-surface-subtle",
						i > 0 && "border-l border-border-soft",
					)}
				>
					<div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
						{item.dot && (
							<span
								className={`w-[7px] h-[7px] rounded-full ${item.dot}`}
							/>
						)}
						{item.icon && (
							<span className="text-blue-600">{item.icon}</span>
						)}
						{item.label}
					</div>
					<div className="font-mono text-[23px] font-bold text-ink-800 tracking-[-0.015em] tabular-nums">
						{item.value}
					</div>
					{item.delta && (
						<div className="text-[11px] font-semibold text-blue-600 mt-1">
							{item.delta}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
