interface LoadingStateProps {
	className?: string;
}

export default function LoadingState({
	className = "text-[#6b7d92]",
}: LoadingStateProps) {
	return <div className={`text-sm ${className}`}>Se încarcă...</div>;
}
