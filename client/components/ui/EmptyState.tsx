interface EmptyStateProps {
	children: React.ReactNode;
}

export default function EmptyState({ children }: EmptyStateProps) {
	return (
		<div className="rounded-xl border border-dashed border-slate-300 bg-surface-subtle p-8 text-sm text-slate-500 text-center flex flex-col items-center gap-2">
			<div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 grid place-items-center">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
				>
					<rect x="3" y="7" width="18" height="13" rx="2" />
					<path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
				</svg>
			</div>
			<span>{children}</span>
		</div>
	);
}
