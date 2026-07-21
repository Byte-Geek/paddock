interface BarData {
	label: string;
	value: number;
	color: string;
}

export default function BarChart({ data }: { data: BarData[] }) {
	const max = Math.max(...data.map((d) => d.value));
	return (
		<div className="flex flex-col gap-5">
			{data.map((d) => (
				<div key={d.label}>
					<div className="flex justify-between mb-1.5">
						<span className="text-[13px] font-medium text-[#0e1f33]">
							{d.label}
						</span>
						<span className="text-[13px] font-bold text-[#0e1f33] font-mono">
							{d.value}
						</span>
					</div>
					<div className="h-2.5 bg-[#e0eef9] rounded-full overflow-hidden">
						<div
							className="h-full rounded-full transition-all duration-500"
							style={{
								width: `${(d.value / max) * 100}%`,
								background: d.color,
							}}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
