import { useEffect, useRef } from "react";

interface AutoGrowTextareaProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export default function AutoGrowTextarea({
	value,
	onChange,
	placeholder,
	className,
}: AutoGrowTextareaProps) {
	const ref = useRef<HTMLTextAreaElement>(null);

	const resize = () => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	};

	useEffect(() => {
		resize();
	}, [value]);

	return (
		<textarea
			ref={ref}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			rows={1}
			className={`resize-none overflow-hidden ${className ?? ""}`}
		/>
	);
}
