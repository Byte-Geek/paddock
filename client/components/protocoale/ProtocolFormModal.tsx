"use client";

import { useState } from "react";
import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";
import api from "@/lib/axios";
import { ProtocolTemplate } from "@/types";
import { getErrorMessage } from "@/lib/error";

interface ProtocolFormModalProps {
	onClose: () => void;
	onSaved: (template: ProtocolTemplate) => void;
}

export default function ProtocolFormModal({
	onClose,
	onSaved,
}: ProtocolFormModalProps) {
	const [name, setName] = useState("");
	const [level, setLevel] = useState("");
	const [description, setDescription] = useState("");
	const [compositionYear, setCompositionYear] = useState("");
	const [revisionYear, setRevisionYear] = useState("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const payload = {
				name,
				level: level || undefined,
				description: description || undefined,
				compositionYear: compositionYear
					? Number(compositionYear)
					: undefined,
				revisionYear: revisionYear ? Number(revisionYear) : undefined,
			};
			const { data } = await api.post<ProtocolTemplate>(
				"/protocol-templates",
				payload,
			);
			onSaved(data);
			onClose();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva protocolul."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<ModalHeader title="Adaugă protocol" onClose={onClose} />
			<form onSubmit={handleSubmit}>
				<ModalBody>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-1">
							<label htmlFor="protocol-name" className="text-xs font-medium text-[var(--color-slate-500)]">
								Nume
							</label>
							<input
								id="protocol-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label htmlFor="protocol-level" className="text-xs font-medium text-[var(--color-slate-500)]">
								Nivel
							</label>
							<input
								id="protocol-level"
								value={level}
								onChange={(e) => setLevel(e.target.value)}
								placeholder="ex: Nivel Începători"
								className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label htmlFor="protocol-description" className="text-xs font-medium text-[var(--color-slate-500)]">
								Descriere
							</label>
							<textarea
								id="protocol-description"
								value={description}
								onChange={(e) =>
									setDescription(e.target.value)
								}
								rows={3}
								className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)] resize-none"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label htmlFor="protocol-composition-year" className="text-xs font-medium text-[var(--color-slate-500)]">
									An compoziție
								</label>
								<input
									id="protocol-composition-year"
									type="number"
									value={compositionYear}
									onChange={(e) =>
										setCompositionYear(e.target.value)
									}
									className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="protocol-revision-year" className="text-xs font-medium text-[var(--color-slate-500)]">
									An revizuire
								</label>
								<input
									id="protocol-revision-year"
									type="number"
									value={revisionYear}
									onChange={(e) =>
										setRevisionYear(e.target.value)
									}
									className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
						</div>

						{error && (
							<div role="alert" className="text-xs text-red-500">
								{error}
							</div>
						)}
					</div>
				</ModalBody>
				<ModalFooter>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-blue-900)] transition"
					>
						Anulează
					</button>
					<button
						type="submit"
						disabled={saving}
						className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
					>
						{saving ? "Se salvează..." : "Salvează"}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
