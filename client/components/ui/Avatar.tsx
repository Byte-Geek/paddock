import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarProps {
	name: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizes = {
	sm: "w-7 h-7 text-xs",
	md: "w-9 h-9 text-sm",
	lg: "w-12 h-12 text-base",
};

export default function Avatar({ name, size = "md", className }: AvatarProps) {
	return (
		<div
			className={cn(
				"rounded-full bg-[var(--color-blue-600)] text-white flex items-center justify-center font-bold flex-shrink-0",
				sizes[size],
				className,
			)}
		>
			{initials(name)}
		</div>
	);
}
