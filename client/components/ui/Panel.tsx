import { cn } from "@/lib/utils";

interface PanelProps {
	title?: string;
	subtitle?: string;
	action?: React.ReactNode;
	noBodyPadding?: boolean;
	className?: string;
	children: React.ReactNode;
}

export default function Panel({
	title,
	subtitle,
	action,
	noBodyPadding = false,
	className,
	children,
}: PanelProps) {
	return (
		<div
			className={cn(
				"bg-surface rounded-lg border border-border shadow-[var(--shadow-panel)] transition-shadow duration-300 hover:shadow-[var(--shadow-panel-hover)] overflow-hidden",
				className,
			)}
		>
			{(title || action) && (
				<div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
					<div>
						{title && (
							<h3 className="font-bold text-[13.5px] text-ink-800 tracking-[-0.01em]">
								{title}
							</h3>
						)}
						{subtitle && (
							<div className="text-[11px] text-slate-500 mt-0.5">
								{subtitle}
							</div>
						)}
					</div>
					{action && <div className="flex-shrink-0">{action}</div>}
				</div>
			)}
			<div className={noBodyPadding ? "" : "p-5"}>{children}</div>
		</div>
	);
}
