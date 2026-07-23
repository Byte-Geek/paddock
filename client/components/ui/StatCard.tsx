interface StatCardProps {
	label: string;
	value: number | string;
	delta?: string;
	deltaPositive?: boolean;
	icon?: React.ReactNode;
}

export default function StatCard({
	label,
	value,
	delta,
	deltaPositive = true,
	icon,
}: StatCardProps) {
	return (
		<div className="group bg-surface rounded-xl p-5 border border-border-soft shadow-[var(--shadow-panel)] transition-all duration-300 ease-out hover:shadow-[var(--shadow-panel-hover)] hover:-translate-y-0.5">
			{icon && (
				<div className="mb-3 w-9 h-9 rounded-md bg-blue-50 text-blue-800 grid place-items-center transition-colors duration-300 group-hover:bg-blue-100">
					{icon}
				</div>
			)}
			<div className="text-slate-500 text-xs font-semibold tracking-[0.01em] mb-1">
				{label}
			</div>
			<div className="text-ink-800 text-[27px] font-mono font-bold tracking-[-0.015em] tabular-nums">
				{value}
			</div>
			{delta && (
				<div
					className={`text-xs mt-1.5 font-semibold ${deltaPositive ? "text-success" : "text-slate-500"}`}
				>
					{delta}
				</div>
			)}
		</div>
	);
}
