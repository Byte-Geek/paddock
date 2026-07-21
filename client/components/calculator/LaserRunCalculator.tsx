"use client";

import { useState } from "react";
import ScoreDisplay from "@/components/calculator/ScoreDisplay";
import { Gender } from "@/types";

const BASE_SECONDS: Record<Gender, number> = {
	M: 720, // 12:00 = 250 puncte
	F: 750, // 12:30 = 250 puncte
};

const POINTS_PER_SECOND = 1;

export default function LaserRunCalculator() {
	const [gender, setGender] = useState<Gender>("M");
	const [minutes, setMinutes] = useState("12");
	const [seconds, setSeconds] = useState("0");

	const totalSeconds = Number(minutes) * 60 + Number(seconds);
	const valid =
		minutes !== "" &&
		seconds !== "" &&
		!Number.isNaN(totalSeconds) &&
		totalSeconds > 0;

	const score = valid
		? Math.max(
				0,
				Math.round(
					250 +
						(BASE_SECONDS[gender] - totalSeconds) *
							POINTS_PER_SECOND,
				),
			)
		: 0;

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-[#6b7d92]">
						Gen
					</label>
					<div className="flex gap-2">
						{(["M", "F"] as const).map((g) => (
							<button
								key={g}
								onClick={() => setGender(g)}
								className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
									gender === g
										? "bg-[#2a6aa6] text-white"
										: "bg-[#f1f7fc] text-[#6b7d92]"
								}`}
							>
								{g === "M" ? "Masculin" : "Feminin"}
							</button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-medium text-[#6b7d92]">
							Minute
						</label>
						<input
							type="number"
							min={0}
							value={minutes}
							onChange={(e) => setMinutes(e.target.value)}
							className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-medium text-[#6b7d92]">
							Secunde
						</label>
						<input
							type="number"
							min={0}
							max={59}
							value={seconds}
							onChange={(e) => setSeconds(e.target.value)}
							className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
						/>
					</div>
				</div>

				<p className="text-xs text-[#8896b3]">
					Timp de bază pentru 250 puncte:{" "}
					{gender === "M" ? "12:00" : "12:30"}. Fiecare secundă mai
					rapidă/lentă valorează {POINTS_PER_SECOND} punct.
				</p>
			</div>

			<ScoreDisplay
				score={score}
				label="Laser-Run — Punctaj calculat"
			/>
		</div>
	);
}
