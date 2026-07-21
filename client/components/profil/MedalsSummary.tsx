import { PersonalMedals } from "@/types";

export default function MedalsSummary({
	medals,
	label,
}: {
	medals: PersonalMedals;
	label?: string;
}) {
	return (
		<div className="grid grid-cols-4 gap-3">
			<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
				<div className="text-2xl">🥇</div>
				<div className="text-xl font-bold text-[#0f1729] mt-1">
					{medals.gold}
				</div>
				<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
					Aur
				</div>
			</div>
			<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
				<div className="text-2xl">🥈</div>
				<div className="text-xl font-bold text-[#0f1729] mt-1">
					{medals.silver}
				</div>
				<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
					Argint
				</div>
			</div>
			<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
				<div className="text-2xl">🥉</div>
				<div className="text-xl font-bold text-[#0f1729] mt-1">
					{medals.bronze}
				</div>
				<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
					Bronz
				</div>
			</div>
			<div className="bg-white rounded-xl border border-[#e8ecf5] p-4 text-center">
				<div className="text-2xl">🏁</div>
				<div className="text-xl font-bold text-[#0f1729] mt-1">
					{medals.total}
				</div>
				<div className="text-[11px] text-[#8896b3] uppercase tracking-wide">
					{label ?? "Participări"}
				</div>
			</div>
		</div>
	);
}
