"use client";

import { useState } from "react";
import ScoreDisplay from "@/components/calculator/ScoreDisplay";

const WIN_RATIO_FOR_250 = 0.7;
const POINTS_POOL = 8000;

export default function FenceCalculator() {
	const [wins, setWins] = useState("14");
	const [totalBouts, setTotalBouts] = useState("20");

	const parsedWins = Number(wins) || 0;
	const parsedTotal = Number(totalBouts) || 0;
	const valid = parsedTotal > 0 && parsedWins >= 0 && parsedWins <= parsedTotal;

	const pointsPerVictory = valid ? POINTS_POOL / parsedTotal : 0;
	const winsAt250 = valid
		? Math.round(WIN_RATIO_FOR_250 * parsedTotal)
		: 0;
	const score = valid
		? Math.max(
				0,
				Math.round(
					250 + (parsedWins - winsAt250) * pointsPerVictory,
				),
			)
		: 0;

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="bg-surface rounded-md border border-[var(--color-border)] p-5 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[var(--color-slate-500)]">
						Victorii
					</label>
					<input
						type="number"
						min={0}
						value={wins}
						onChange={(e) => setWins(e.target.value)}
						className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[var(--color-slate-500)]">
						Total asalturi
					</label>
					<input
						type="number"
						min={1}
						value={totalBouts}
						onChange={(e) => setTotalBouts(e.target.value)}
						className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
					/>
				</div>

				{!valid && (
					<p className="text-xs text-red-500">
						Numărul de victorii nu poate depăși totalul de
						asalturi.
					</p>
				)}

				<p className="text-xs text-[var(--color-slate-500)]">
					250 puncte la o rată de victorii de 70% (
					{winsAt250} victorii din {parsedTotal || "—"}). Fiecare
					victorie peste/sub prag valorează{" "}
					{Math.round(pointsPerVictory)} puncte.
				</p>
			</div>

			<ScoreDisplay score={score} label="Spadă — Punctaj calculat" />
		</div>
	);
}
