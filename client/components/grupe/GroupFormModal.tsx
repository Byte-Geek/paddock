"use client";

import { useEffect, useState } from "react";
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/Modal";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import { formatFullName } from "@/lib/utils";
import type { Coach, Group } from "@/types";

interface GroupFormModalProps {
	group: Group | null;
	onClose: () => void;
	onSaved: (group: Group) => void;
}

export default function GroupFormModal({
	group,
	onClose,
	onSaved,
}: GroupFormModalProps) {
	const [name, setName] = useState(group?.name ?? "");
	const [description, setDescription] = useState(group?.description ?? "");
	const [coachId, setCoachId] = useState(group?.coach.id ?? "");
	const [coaches, setCoaches] = useState<Coach[]>([]);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadCoaches = async () => {
			try {
				const { data } = await api.get<Coach[]>("/coaches");
				setCoaches(data);
				if (!group && data.length > 0) {
					setCoachId((prev) => prev || data[0].id);
				}
			} catch (error) {
				console.error("Failed to load coaches", error);
			}
		};

		loadCoaches();
	}, [group]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const payload = { name, description, coachId };
			const { data } = group
				? await api.patch<Group>(`/groups/${group.id}`, payload)
				: await api.post<Group>("/groups", payload);
			onSaved(data);
			onClose();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva grupa."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit}>
				<ModalHeader
					title={group ? "Editează grupă" : "Adaugă grupă"}
					onClose={onClose}
				/>
				<ModalBody>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-1">
							<label
								htmlFor="group-name"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Nume grupă
							</label>
							<input
								id="group-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="group-description"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Descriere
							</label>
							<textarea
								id="group-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)] resize-none"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="group-coach"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Antrenor
							</label>
							<select
								id="group-coach"
								value={coachId}
								onChange={(e) => setCoachId(e.target.value)}
								required
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							>
								{coaches.length === 0 && (
									<option value="">Niciun antrenor disponibil</option>
								)}
								{coaches.map((c) => (
									<option key={c.id} value={c.id}>
										{formatFullName(c.firstName, c.lastName, c.email)}
									</option>
								))}
							</select>
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
						className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-slate-500)] hover:bg-[var(--color-blue-50)]"
					>
						Anulează
					</button>
					<button
						type="submit"
						disabled={saving || !coachId}
						className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
					>
						{saving ? "Se salvează..." : "Salvează"}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
