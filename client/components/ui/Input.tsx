import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				"border border-[var(--color-border)] rounded-md px-3 py-2 text-sm outline-none transition focus:border-[var(--color-blue-600)] focus:ring-4 focus:ring-[var(--color-blue-600)]/10",
				className || undefined,
			)}
			{...props}
		/>
	);
}
