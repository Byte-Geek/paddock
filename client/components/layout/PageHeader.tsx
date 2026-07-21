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
		<div className="flex items-start justify-between mb-6">
			<div>
				<h1 className="text-[#0f1729] text-2xl font-bold">{title}</h1>
				{subtitle && (
					<p className="text-[#8896b3] text-sm mt-1 max-w-xl">
						{subtitle}
					</p>
				)}
			</div>
			{actions && <div className="flex-shrink-0">{actions}</div>}
		</div>
	);
}
