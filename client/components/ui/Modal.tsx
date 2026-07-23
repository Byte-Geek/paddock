"use client";

interface ModalProps {
	onClose: () => void;
	children: React.ReactNode;
	wide?: boolean;
}

export default function Modal({ onClose, children, wide = false }: ModalProps) {
	return (
		<div
			className="fixed inset-0 bg-blue-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-[fade-in_0.15s_ease-out]"
			onClick={onClose}
		>
			<div
				className={`bg-surface rounded-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} shadow-[var(--shadow-float)] max-h-[88vh] overflow-y-auto animate-[modal-in_0.18s_cubic-bezier(0.16,1,0.3,1)]`}
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
		<div className="flex items-start justify-between px-6 py-5 border-b border-border-soft">
			<div>
				<h3 className="font-bold text-ink-800 text-lg tracking-[-0.01em]">{title}</h3>
				{subtitle && (
					<p className="text-sm text-slate-500 mt-1">{subtitle}</p>
				)}
			</div>
			<button
				onClick={onClose}
				className="text-slate-500 hover:text-ink-800 transition-colors duration-200 text-xl ml-4"
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
		<div className="flex justify-end gap-3 px-6 py-4 border-t border-border-soft">
			{children}
		</div>
	);
}
