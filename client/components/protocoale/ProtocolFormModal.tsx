"use client";

import { useState } from "react";
import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";
import api from "@/lib/axios";
import { ProtocolTemplate, ScoringAlgorithm } from "@/types";

interface ProtocolFormModalProps {
	template: ProtocolTemplate | null;
	onClose: () => void;
	onSaved: (template: ProtocolTemplate) => void;
}

const algorithmOptions: { value: ScoringAlgorithm; label: string }[] = [
	{ value: "SUM", label: "Sumă" },
	{ value: "AVERAGE", label: "Medie" },
	{ value: "AVERAGE_DROP_HIGH_LOW", label: "Medie fără extreme" },
	{ value: "WEIGHTED_SUM", label: "Sumă ponderată" },
];

export default function ProtocolFormModal({
	template,
	onClose,
	onSaved,
}: ProtocolFormModalProps) {
	const [name, setName] = useState(template?.name ?? "");
	const [level, setLevel] = useState(template?.level ?? "");
	const [description, setDescription] = useState(
		template?.description ?? "",
	);
	const [compositionYear, setCompositionYear] = useState(
		template?.compositionYear?.toString() ?? "",
	);
	const [revisionYear, setRevisionYear] = useState(
		template?.revisionYear?.toString() ?? "",
	);
	const [scoringAlgorithm, setScoringAlgorithm] = useState<ScoringAlgorithm>(
		template?.scoringAlgorithm ?? "SUM",
	);
	const [active, setActive] = useState(template?.active ?? true);
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
				scoringAlgorithm,
				active,
			};
			const { data } = template
				? await api.patch<ProtocolTemplate>(
						`/protocol-templates/${template.id}`,
						payload,
					)
				: await api.post<ProtocolTemplate>(
						"/protocol-templates",
						payload,
					);
			onSaved(data);
			onClose();
		} catch (err: unknown) {
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut salva protocolul.";
			setError(Array.isArray(message) ? message.join(", ") : message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<ModalHeader
				title={template ? "Editează protocol" : "Adaugă protocol"}
				onClose={onClose}
			/>
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

						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#6b7d92]">
								Algoritm de punctaj
							</label>
							<select
								value={scoringAlgorithm}
								onChange={(e) =>
									setScoringAlgorithm(
										e.target.value as ScoringAlgorithm,
									)
								}
								className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
							>
								{algorithmOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<label className="flex items-center gap-2 text-sm text-[#0e1f33]">
							<input
								type="checkbox"
								checked={active}
								onChange={(e) => setActive(e.target.checked)}
							/>
							Activ
						</label>

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
