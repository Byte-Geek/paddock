"use client";

interface Tab {
	key: string;
	label: string;
	count?: number;
}

interface TabBarProps {
	tabs: Tab[];
	active: string;
	onChange: (key: string) => void;
}

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
	return (
		<div className="flex border-b border-[#e8ecf5] mb-6">
			{tabs.map((tab) => (
				<button
					key={tab.key}
					onClick={() => onChange(tab.key)}
					className={`px-5 py-3 text-sm font-medium transition border-b-2 -mb-px flex items-center gap-2 ${
						active === tab.key
							? "border-[#4a7adb] text-[#4a7adb]"
							: "border-transparent text-[#8896b3] hover:text-[#0f1729]"
					}`}
				>
					{tab.label}
					{tab.count !== undefined && (
						<span
							className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
								active === tab.key
									? "bg-[#4a7adb] text-white"
									: "bg-[#f4f6fb] text-[#8896b3]"
							}`}
						>
							{tab.count}
						</span>
					)}
				</button>
			))}
		</div>
	);
}
