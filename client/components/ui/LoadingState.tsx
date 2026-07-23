interface LoadingStateProps {
	className?: string;
}

export default function LoadingState({
	className = "text-[var(--color-slate-500)]",
}: LoadingStateProps) {
	return (
		<div className={`text-sm flex items-center gap-2 ${className}`}>
			<span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
			Se încarcă...
		</div>
	);
}
