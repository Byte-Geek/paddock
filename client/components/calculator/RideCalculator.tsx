"use client";

import { useState } from "react";
import ScoreDisplay from "@/components/calculator/ScoreDisplay";

const BASE_SCORE = 300;
const POINTS_PER_KNOCKDOWN = 20;
const POINTS_PER_REFUSAL = 40;
const POINTS_PER_TIME_FAULT_SECOND = 4;

export default function RideCalculator() {
	const [knockdowns, setKnockdowns] = useState("0");
	const [refusals, setRefusals] = useState("0");
	const [timeFaultSeconds, setTimeFaultSeconds] = useState("0");

	const parsed = {
		knockdowns: Number(knockdowns) || 0,
		refusals: Number(refusals) || 0,
		timeFaultSeconds: Number(timeFaultSeconds) || 0,
	};

	const score = Math.max(
		0,
		Math.round(
			BASE_SCORE -
				parsed.knockdowns * POINTS_PER_KNOCKDOWN -
				parsed.refusals * POINTS_PER_REFUSAL -
				parsed.timeFaultSeconds * POINTS_PER_TIME_FAULT_SECOND,
		),
	);

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[#6b7d92]">
						Obstacole doborâte
					</label>
					<input
						type="number"
						min={0}
						value={knockdowns}
						onChange={(e) => setKnockdowns(e.target.value)}
						className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[#6b7d92]">
						Refuzuri
					</label>
					<input
						type="number"
						min={0}
						value={refusals}
						onChange={(e) => setRefusals(e.target.value)}
						className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[#6b7d92]">
						Secunde peste timpul admis
					</label>
					<input
						type="number"
						min={0}
						value={timeFaultSeconds}
						onChange={(e) => setTimeFaultSeconds(e.target.value)}
						className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
					/>
				</div>

				<p className="text-xs text-[#8896b3]">
					Bază: {BASE_SCORE} puncte pentru parcurs curat în timp. Se
					scad {POINTS_PER_KNOCKDOWN} pct/obstacol dobo­rât,{" "}
					{POINTS_PER_REFUSAL} pct/refuz,{" "}
					{POINTS_PER_TIME_FAULT_SECOND} pct/secundă depășire.
				</p>
			</div>

			<ScoreDisplay score={score} label="Călărie — Punctaj calculat" />
		</div>
	);
}
