interface Series {
	month: string;
	a: number;
	b: number;
}

export default function LineChart({ series }: { series: Series[] }) {
	const W = 600,
		H = 220,
		P = 30;
	const max = Math.max(...series.flatMap((s) => [s.a, s.b])) * 1.1;
	const xs = (i: number) => P + (i * (W - P * 2)) / (series.length - 1);
	const ys = (v: number) => H - P - (v / max) * (H - P * 2);
	const pathA = series
		.map((s, i) => `${i === 0 ? "M" : "L"}${xs(i)} ${ys(s.a)}`)
		.join(" ");
	const pathB = series
		.map((s, i) => `${i === 0 ? "M" : "L"}${xs(i)} ${ys(s.b)}`)
		.join(" ");
	const fillA = `${pathA} L${xs(series.length - 1)} ${H - P} L${xs(0)} ${H - P} Z`;

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className="w-full"
			style={{ height: 220 }}
		>
			<defs>
				<linearGradient id="lg-a" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#205280" stopOpacity="0.2" />
					<stop offset="100%" stopColor="#205280" stopOpacity="0" />
				</linearGradient>
			</defs>
			{[0.25, 0.5, 0.75, 1].map((f, i) => (
				<line
					key={i}
					x1={P}
					x2={W - P}
					y1={ys(max * f)}
					y2={ys(max * f)}
					stroke="#eef2f7"
					strokeWidth="1"
				/>
			))}
			{series.map((s, i) => (
				<text
					key={i}
					x={xs(i)}
					y={H - 8}
					fontSize="11"
					fill="#94a3b8"
					textAnchor="middle"
				>
					{s.month}
				</text>
			))}
			<path d={fillA} fill="url(#lg-a)" />
			<path
				d={pathA}
				fill="none"
				stroke="#2a6aa6"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d={pathB}
				fill="none"
				stroke="#6cb0e6"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray="4 4"
			/>
			{series.map((s, i) => (
				<g key={i}>
					<circle
						cx={xs(i)}
						cy={ys(s.a)}
						r="3.5"
						fill="#fff"
						stroke="#2a6aa6"
						strokeWidth="2"
					/>
					<circle
						cx={xs(i)}
						cy={ys(s.b)}
						r="3"
						fill="#fff"
						stroke="#6cb0e6"
						strokeWidth="2"
					/>
				</g>
			))}
		</svg>
	);
}
