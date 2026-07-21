"use client";

import { useState } from "react";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import api from "@/lib/axios";
import { CompetitionEvent, EventStatus } from "@/types";

interface CompetitionFormModalProps {
	competition: CompetitionEvent | null;
	onClose: () => void;
	onSaved: (competition: CompetitionEvent) => void;
}

const statusOptions: { value: EventStatus; label: string }[] = [
	{ value: "DRAFT", label: "Ciornă" },
	{ value: "PUBLISHED", label: "Publicată" },
	{ value: "ONGOING", label: "În desfășurare" },
	{ value: "COMPLETED", label: "Finalizată" },
	{ value: "CANCELLED", label: "Anulată" },
];

function toDateInput(value: string | null): string {
	if (!value) return "";
	return value.slice(0, 10);
}

export default function CompetitionFormModal({
	competition,
	onClose,
	onSaved,
}: CompetitionFormModalProps) {
	const [name, setName] = useState(competition?.name ?? "");
	const [location, setLocation] = useState(competition?.location ?? "");
	const [description, setDescription] = useState(
		competition?.description ?? "",
	);
	const [startDate, setStartDate] = useState(
		toDateInput(competition?.startDate ?? null),
	);
	const [endDate, setEndDate] = useState(
		toDateInput(competition?.endDate ?? null),
	);
	const [status, setStatus] = useState<EventStatus>(
		competition?.status ?? "DRAFT",
	);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const payload = {
				name,
				location: location || undefined,
				description: description || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				status,
			};
			const { data } = competition
				? await api.patch<CompetitionEvent>(
						`/events/${competition.id}`,
						payload,
					)
				: await api.post<CompetitionEvent>("/events", payload);
			onSaved(data);
			onClose();
		} catch (err: unknown) {
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut salva competiția.";
			setError(Array.isArray(message) ? message.join(", ") : message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<ModalHeader
				title={competition ? "Editează competiție" : "Creează competiție"}
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
								Locație
							</label>
							<input
								value={location}
								onChange={(e) => setLocation(e.target.value)}
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
									Data început
								</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) =>
										setStartDate(e.target.value)
									}
									className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-[#6b7d92]">
									Data sfârșit
								</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) =>
										setEndDate(e.target.value)
									}
									className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#6b7d92]">
								Status
							</label>
							<select
								value={status}
								onChange={(e) =>
									setStatus(e.target.value as EventStatus)
								}
								className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
							>
								{statusOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
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
