"use client";

import { useEffect, useState } from "react";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import api from "@/lib/axios";
import { CompetitionEvent, EventStatus, EventSecretary } from "@/types";
import SecretaryMultiSelect from "./SecretaryMultiSelect";
import { EVENT_STATUS_OPTIONS } from "@/lib/constants/event-status";
import { getErrorMessage } from "@/lib/error";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";

interface CompetitionFormModalProps {
	competition: CompetitionEvent | null;
	onClose: () => void;
	onSaved: (competition: CompetitionEvent) => void;
}

const statusOptions = EVENT_STATUS_OPTIONS;

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
	const [secretaries, setSecretaries] = useState<EventSecretary[]>([]);
	const [secretaryIds, setSecretaryIds] = useState<string[]>(
		competition?.secretaries?.map((s) => s.id) ?? [],
	);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadSecretaries = async () => {
			try {
				const { data } = await api.get<EventSecretary[]>("/users", {
					params: { role: "MODERATOR" },
				});
				setSecretaries(data);
			} catch (error) {
				console.error("Failed to load secretaries", error);
			}
		};

		loadSecretaries();
	}, []);

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
				secretaryIds,
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
			setError(getErrorMessage(err, "Nu s-a putut salva competiția."));
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
							<Label>Nume</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>Locație</Label>
							<Input
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[var(--color-slate-500)]">
								Descriere
							</label>
							<textarea
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
								<Label>Data început</Label>
								<Input
									type="date"
									value={startDate}
									onChange={(e) =>
										setStartDate(e.target.value)
									}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label>Data sfârșit</Label>
								<Input
									type="date"
									value={endDate}
									onChange={(e) =>
										setEndDate(e.target.value)
									}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<Label>Status</Label>
							<Select
								value={status}
								onChange={(e) =>
									setStatus(e.target.value as EventStatus)
								}
							>
								{statusOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</Select>
						</div>

						<div className="flex flex-col gap-1">
							<Label>Secretari</Label>
							<SecretaryMultiSelect
								options={secretaries}
								selectedIds={secretaryIds}
								onChange={setSecretaryIds}
							/>
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
