import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				"border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]",
				className || undefined,
			)}
			{...props}
		/>
	);
}
