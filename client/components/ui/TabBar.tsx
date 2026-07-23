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
		<div className="flex border-b border-[var(--color-border-soft)] mb-6">
			{tabs.map((tab) => (
				<button
					key={tab.key}
					onClick={() => onChange(tab.key)}
					className={`px-5 py-3 text-sm font-medium transition border-b-2 -mb-px flex items-center gap-2 ${
						active === tab.key
							? "border-[var(--color-blue-600)] text-[var(--color-blue-600)]"
							: "border-transparent text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)]"
					}`}
				>
					{tab.label}
					{tab.count !== undefined && (
						<span
							className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
								active === tab.key
									? "bg-[var(--color-blue-600)] text-white"
									: "bg-[var(--color-silver-bg)] text-[var(--color-slate-500)]"
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
