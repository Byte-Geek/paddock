"use client";

interface ModalProps {
	onClose: () => void;
	children: React.ReactNode;
	wide?: boolean;
}

export default function Modal({ onClose, children, wide = false }: ModalProps) {
	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className={`bg-white rounded-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} shadow-xl`}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}

export function ModalHeader({
	title,
	subtitle,
	onClose,
}: {
	title: string;
	subtitle?: string;
	onClose: () => void;
}) {
	return (
		<div className="flex items-start justify-between px-6 py-5 border-b border-[#e8ecf5]">
			<div>
				<h3 className="font-bold text-[#0f1729] text-lg">{title}</h3>
				{subtitle && (
					<p className="text-sm text-[#8896b3] mt-1">{subtitle}</p>
				)}
			</div>
			<button
				onClick={onClose}
				className="text-[#8896b3] hover:text-[#0f1729] transition text-xl ml-4"
			>
				✕
			</button>
		</div>
	);
}

export function ModalBody({
	children,
	noPadding = false,
}: {
	children: React.ReactNode;
	noPadding?: boolean;
}) {
	return <div className={noPadding ? "" : "p-6"}>{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e8ecf5]">
			{children}
		</div>
	);
}
