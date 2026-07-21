interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export default function SearchInput({
	value,
	onChange,
	placeholder,
	className,
}: SearchInputProps) {
	return (
		<div
			className={`flex items-center gap-2 bg-white border border-[#e8ecf5] rounded-lg px-3 py-2 text-[#8896b3] ${className ?? ""}`}
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
				placeholder={placeholder}
				className="bg-transparent border-0 outline-none text-[#0f1729] text-sm flex-1 min-w-0 placeholder:text-[#b0bcd4]"
			/>
		</div>
	);
}
