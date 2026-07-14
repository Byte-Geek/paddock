interface StatCardProps {
	label: string;
	value: number | string;
	delta?: string;
	deltaPositive?: boolean;
	icon?: React.ReactNode;
}

export default function StatCard({
	label,
	value,
	delta,
	deltaPositive = true,
	icon,
}: StatCardProps) {
	return (
		<div className="bg-white rounded-xl p-5 border border-[#e8ecf5]">
			{icon && <div className="mb-2">{icon}</div>}
			<div className="text-[#8896b3] text-xs font-medium mb-1">
				{label}
			</div>
			<div className="text-[#0f1729] text-2xl font-bold">{value}</div>
			{delta && (
				<div
					className={`text-xs mt-1 font-medium ${deltaPositive ? "text-green-500" : "text-[#8896b3]"}`}
				>
					{delta}
				</div>
			)}
		</div>
	);
}
