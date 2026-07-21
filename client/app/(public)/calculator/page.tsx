"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import TabBar from "@/components/ui/TabBar";
import SwimCalculator from "@/components/calculator/SwimCalculator";
import RideCalculator from "@/components/calculator/RideCalculator";
import FenceCalculator from "@/components/calculator/FenceCalculator";
import LaserRunCalculator from "@/components/calculator/LaserRunCalculator";

const tabs = [
	{ key: "inot", label: "Înot 200m" },
	{ key: "calarie", label: "Călărie" },
	{ key: "spada", label: "Spadă" },
	{ key: "laserrun", label: "Laser-Run" },
];

export default function CalculatorPage() {
	const [tab, setTab] = useState("inot");

	return (
		<div>
			<PageHeader
				title="Calculator PMD"
				subtitle="Calculul punctajului UIPM pentru cele patru probe ale pentatlonului modern"
			/>

			<TabBar tabs={tabs} active={tab} onChange={setTab} />

			<div className="max-w-2xl">
				{tab === "inot" && <SwimCalculator />}
				{tab === "calarie" && <RideCalculator />}
				{tab === "spada" && <FenceCalculator />}
				{tab === "laserrun" && <LaserRunCalculator />}

				{/* Info */}
				<div className="mt-4 bg-white rounded-[10px] border border-[#e2e8f0] p-4 flex gap-3">
					<div className="w-8 h-8 rounded-[8px] bg-[#e0eef9] text-[#205280] grid place-items-center flex-shrink-0">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
					</div>
					<p className="text-[13px] text-[#6b7d92] leading-relaxed">
						<b className="text-[#0e1f33]">Despre Calculator PMD.</b>{" "}
						Folosit pentru estimarea rapidă a punctajului oficial
						UIPM în fiecare din probele pentatlonului modern.
						Formulele aplicate sunt cele standard ale Federației
						Internaționale de Pentatlon Modern. Pentru competiții
						oficiale, verifică tabelele de punctaj UIPM curente.
					</p>
				</div>
			</div>
		</div>
	);
}
