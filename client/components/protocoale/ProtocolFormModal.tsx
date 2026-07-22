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
							<label className="text-xs font-medium text-[#6b7d92]">
								Nume
							</label>
							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#6b7d92]">
								Nivel
							</label>
							<input
								value={level}
								onChange={(e) => setLevel(e.target.value)}
								placeholder="ex: Nivel Începători"
								className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#6b7d92]">
								Descriere
							</label>
							<textarea
								value={description}
								onChange={(e) =>
									setDescription(e.target.value)
								}
								rows={3}
								className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6] resize-none"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-[#6b7d92]">
									An compoziție
								</label>
								<input
									type="number"
									value={compositionYear}
									onChange={(e) =>
										setCompositionYear(e.target.value)
									}
									className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-[#6b7d92]">
									An revizuire
								</label>
								<input
									type="number"
									value={revisionYear}
									onChange={(e) =>
										setRevisionYear(e.target.value)
									}
									className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
								/>
							</div>
						</div>

						{error && (
							<div className="text-xs text-red-500">
								{error}
							</div>
						)}
					</div>
				</ModalBody>
				<ModalFooter>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm text-[#6b7d92] hover:text-[#0e1f33] transition"
					>
						Anulează
					</button>
					<button
						type="submit"
						disabled={saving}
						className="bg-[#2a6aa6] hover:bg-[#205280] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
					>
						{saving ? "Se salvează..." : "Salvează"}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
