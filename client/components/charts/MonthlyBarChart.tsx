interface Series {
	month: string;
	a: number;
	b: number;
}

export default function MonthlyBarChart({ series }: { series: Series[] }) {
	const max = Math.max(1, ...series.map((s) => s.a + s.b));
	const ticks = [1, 0.75, 0.5, 0.25, 0];

	return (
		<div className="grid grid-cols-[34px_1fr] gap-2.5">
			<div className="flex flex-col justify-between text-right text-[10px] text-slate-500 h-[190px]">
				{ticks.map((t) => (
					<span key={t}>{Math.round(max * t)}</span>
				))}
			</div>
			<div className="relative h-[190px] border-l border-b border-border-soft">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(var(--color-border-soft) 1px, transparent 1px)",
						backgroundSize: "100% 25%",
					}}
				/>
				<div className="absolute inset-0 flex items-end justify-around gap-2 px-1.5">
					{series.map((s, i) => (
						<div
							key={i}
							className="flex-1 flex flex-col justify-end gap-0.5 h-full"
						>
							<div
								className="bg-blue-600 rounded-t-sm"
								style={{ height: `${(s.a / max) * 100}%` }}
							/>
							<div
								className="bg-blue-300"
								style={{ height: `${(s.b / max) * 100}%` }}
							/>
						</div>
					))}
				</div>
			</div>
			<div />
			<div className="grid gap-2 text-center text-[11px] text-slate-500 px-1.5" style={{ gridTemplateColumns: `repeat(${series.length}, 1fr)` }}>
				{series.map((s, i) => (
					<span key={i}>{s.month}</span>
				))}
			</div>
		</div>
	);
}
