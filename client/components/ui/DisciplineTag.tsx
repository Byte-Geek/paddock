interface DisciplineTagProps {
	discipline: "hipism" | "pentatlon";
	short?: boolean;
}

export default function DisciplineTag({
	discipline,
	short = false,
}: DisciplineTagProps) {
	const isHipism = discipline === "hipism";
	return (
		<span
			className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
				isHipism
					? "bg-pink-100 text-pink-700"
					: "bg-cyan-100 text-cyan-700"
			}`}
		>
			{short
				? isHipism
					? "HIP"
					: "PMD"
				: isHipism
					? "Hipism"
					: "Pentatlon"}
		</span>
	);
}
