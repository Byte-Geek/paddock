interface DonutData {
	label: string;
	value: number;
	color: string;
}

export default function DonutChart({ data }: { data: DonutData[] }) {
	const R = 80,
		r = 50,
		C = 200;
	const total = data.reduce((s, d) => s + d.value, 0) || 1;
	let cum = 0;

	const segs = data.map((d) => {
		const start = (cum / total) * Math.PI * 2 - Math.PI / 2;
		cum += d.value;
		const end = (cum / total) * Math.PI * 2 - Math.PI / 2;
		const large = end - start > Math.PI ? 1 : 0;
		const x1 = C + R * Math.cos(start),
			y1 = C + R * Math.sin(start);
		const x2 = C + R * Math.cos(end),
			y2 = C + R * Math.sin(end);
		const x3 = C + r * Math.cos(end),
			y3 = C + r * Math.sin(end);
		const x4 = C + r * Math.cos(start),
			y4 = C + r * Math.sin(start);
		return {
			path: `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`,
			...d,
		};
	});

	return (
		<div className="flex items-center gap-6">
			<svg viewBox="0 0 400 400" width="160" height="160">
				{segs.map((s, i) => (
					<path key={i} d={s.path} fill={s.color} />
				))}
				<text
					x="200"
					y="195"
					textAnchor="middle"
					fontSize="36"
					fontWeight="800"
					fill="#0e1f33"
				>
					{total}
				</text>
				<text
					x="200"
					y="225"
					textAnchor="middle"
					fontSize="14"
					fill="#94a3b8"
				>
					total
				</text>
			</svg>
			<div className="flex flex-col gap-2">
				{segs.map((s) => (
					<div
						key={s.label}
						className="flex items-center gap-2 text-[13px]"
					>
						<span
							className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0"
							style={{ background: s.color }}
						/>
						<span className="text-[#6b7d92]">{s.label}</span>
						<span className="font-bold text-[#0e1f33] ml-1">
							{s.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
