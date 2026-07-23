interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	onFocus?: () => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	autoFocus?: boolean;
}

export default function SearchInput({
	value,
	onChange,
	placeholder,
	className,
	onFocus,
	onKeyDown,
	autoFocus,
}: SearchInputProps) {
	return (
		<div
			className={`flex items-center gap-2 bg-surface border border-[var(--color-border-soft)] rounded-md px-3 py-2 text-[var(--color-slate-500)] transition focus-within:border-[var(--color-blue-600)] focus-within:ring-4 focus-within:ring-[var(--color-blue-600)]/10 ${className ?? ""}`}
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="flex-shrink-0"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.35-4.35" />
			</svg>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={onFocus}
				onKeyDown={onKeyDown}
				autoFocus={autoFocus}
				placeholder={placeholder}
				className="bg-transparent border-0 outline-none text-[var(--color-ink-800)] text-sm flex-1 min-w-0 placeholder:text-[var(--color-slate-400)]"
			/>
		</div>
	);
}
