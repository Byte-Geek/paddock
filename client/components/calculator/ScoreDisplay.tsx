interface ScoreDisplayProps {
	score: number;
	label: string;
}

export default function ScoreDisplay({ score, label }: ScoreDisplayProps) {
	const category =
		score >= 280
			? "Excelent"
			: score >= 200
				? "Bun"
				: score >= 120
					? "Satisfăcător"
					: "Slab";

	const diff = score - 250;

	return (
		<div className="bg-gradient-to-br from-[var(--color-ink-900)] to-[var(--color-ink-900)] rounded-lg p-6 text-white flex flex-col justify-between min-h-[220px]">
			<div>
				<div className="text-[11px] uppercase tracking-[0.1em] text-white/55 font-semibold mb-2">
					{label}
				</div>
				<div className="text-[64px] font-bold leading-none text-white">
					{score}
				</div>
				<div className="text-[13px] text-white/70 mt-1">
					puncte UIPM
				</div>
			</div>
			<div className="border-t border-white/15 pt-4 mt-4 grid grid-cols-2 gap-4">
				<div>
					<div className="text-[10px] text-white/50 uppercase tracking-[0.08em]">
						Categorie
					</div>
					<div className="text-[18px] font-bold mt-0.5">
						{category}
					</div>
				</div>
				<div>
					<div className="text-[10px] text-white/50 uppercase tracking-[0.08em]">
						Diferență
					</div>
					<div
						className={`text-[18px] font-bold mt-0.5 ${diff >= 0 ? "text-green-400" : "text-red-400"}`}
					>
						{diff >= 0 ? "+" : ""}
						{diff}
					</div>
				</div>
			</div>
		</div>
	);
}
