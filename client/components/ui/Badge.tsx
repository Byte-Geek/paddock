import { cn } from "@/lib/utils";

type BadgeVariant =
	| "default"
	| "success"
	| "warning"
	| "danger"
	| "gray"
	| "blue";

interface BadgeProps {
	children: React.ReactNode;
	variant?: BadgeVariant;
	className?: string;
}

const variants: Record<BadgeVariant, string> = {
	default: "bg-blue-50 text-blue-800",
	success: "bg-success-bg text-success",
	warning: "bg-warning-bg text-warning",
	danger: "bg-danger-bg text-danger",
	gray: "bg-silver-bg text-slate-500",
	blue: "bg-blue-600 text-white",
};

export default function Badge({
	children,
	variant = "default",
	className,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold tracking-[0.01em]",
				variants[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
