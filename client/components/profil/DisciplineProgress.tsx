import { DisciplineProgress as DisciplineProgressType } from "@/types";

const disciplineLabels: Record<string, string> = {
	DRESSAGE: "Dresaj",
	SHOW_JUMPING: "Sărituri peste obstacole",
};

export default function DisciplineProgress({
	data,
}: {
	data: DisciplineProgressType[];
}) {
	return (
		<div>
			<h3 className="font-semibold text-ink-800 mb-3">
				Progres pe discipline
			</h3>
			<div className="bg-surface rounded-md border border-border-soft p-5 flex flex-col gap-4">
				{data.map((d) => (
					<div key={d.discipline}>
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-[13px] font-semibold text-ink-800">
								{disciplineLabels[d.discipline] ??
									d.discipline}
							</span>
							<span className="font-mono text-[13px] font-bold text-blue-600 tabular-nums">
								{d.avgPercentage !== null
									? `${d.avgPercentage.toFixed(1)}%`
									: "—"}
							</span>
						</div>
						<div className="h-2 bg-blue-50 rounded-full overflow-hidden">
							<div
								className="h-full bg-blue-600 rounded-full transition-all duration-500"
								style={{
									width: `${d.avgPercentage ?? 0}%`,
								}}
							/>
						</div>
						<div className="text-[11px] text-slate-500 mt-1">
							{d.count > 0
								? `${d.count} participări evaluate`
								: "Nicio participare evaluată încă"}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
