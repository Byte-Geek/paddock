interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

export default function PageHeader({
	title,
	subtitle,
	actions,
}: PageHeaderProps) {
	return (
		<div className="flex items-start justify-between mb-7 pb-5 border-b border-[var(--color-border-soft)]">
			<div>
				<h1 className="text-[var(--color-ink-800)] text-[26px] font-bold tracking-[-0.01em]">
					{title}
				</h1>
				{subtitle && (
					<p className="text-[var(--color-slate-500)] text-sm mt-1.5 max-w-xl leading-relaxed">
						{subtitle}
					</p>
				)}
			</div>
			{actions && <div className="flex-shrink-0">{actions}</div>}
		</div>
	);
}
