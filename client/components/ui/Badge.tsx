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
	default: "bg-[#f4f6fb] text-[#4a7adb]",
	success: "bg-green-100 text-green-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
	gray: "bg-[#f4f6fb] text-[#8896b3]",
	blue: "bg-[#4a7adb] text-white",
};

export default function Badge({
	children,
	variant = "default",
	className,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
				variants[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
