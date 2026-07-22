interface EmptyStateProps {
	children: React.ReactNode;
}

export default function EmptyState({ children }: EmptyStateProps) {
	return (
		<div className="rounded-[10px] border border-[#e2e8f0] bg-white p-6 text-sm text-[#6b7d92]">
			{children}
		</div>
	);
}
