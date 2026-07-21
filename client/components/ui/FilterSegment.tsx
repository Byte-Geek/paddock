"use client";

interface Option {
	key: string;
	label: string;
}

interface FilterSegmentProps {
	options: Option[];
	active: string;
	onChange: (key: string) => void;
}

export default function FilterSegment({
	options,
	active,
	onChange,
}: FilterSegmentProps) {
	return (
		<div className="flex bg-white border border-[#e8ecf5] rounded-lg overflow-hidden">
			{options.map((opt) => (
				<button
					key={opt.key}
					onClick={() => onChange(opt.key)}
					className={`px-4 py-2 text-sm font-medium transition ${
						active === opt.key
							? "bg-[#4a7adb] text-white"
							: "text-[#8896b3] hover:text-[#0f1729]"
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}
