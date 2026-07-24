interface BarData {
	label: string;
	value: number;
	color: string;
}

export default function BarChart({ data }: { data: BarData[] }) {
	const max = Math.max(...data.map((d) => d.value));
	return (
		<div className="flex flex-col gap-3.5">
			{data.map((d, i) => (
				<div
					key={d.label}
					className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4"
				>
					<div>
						<div className="text-[13px] font-semibold text-ink-800 mb-1.5 truncate">
							{d.label}
						</div>
						<div className="h-4 bg-border-soft rounded-sm overflow-hidden">
							<div
								className="h-full rounded-sm transition-all duration-500"
								style={{
									width: `${(d.value / max) * 100}%`,
									background:
										i < 3 ? "var(--color-blue-600)" : "var(--color-blue-300)",
								}}
							/>
						</div>
					</div>
					<span className="font-mono text-[15px] font-bold text-ink-800 text-right tabular-nums">
						{d.value}
					</span>
				</div>
			))}
		</div>
	);
}
