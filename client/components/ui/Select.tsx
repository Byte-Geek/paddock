import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...props }: SelectProps) {
	return (
		<select
			className={cn(
				"border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]",
				className || undefined,
			)}
			{...props}
		>
			{children}
		</select>
	);
}
