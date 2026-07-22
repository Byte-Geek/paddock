import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ className, children, ...props }: LabelProps) {
	return (
		<label
			className={cn("text-xs font-medium text-[#6b7d92]", className || undefined)}
			{...props}
		>
			{children}
		</label>
	);
}
