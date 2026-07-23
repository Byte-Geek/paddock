"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Coach, Group } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { formatFullName } from "@/lib/utils";

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
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
			<div className="bg-surface rounded-2xl w-full max-w-md p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold text-[var(--color-ink-800)]">
						{group ? "Editează grupă" : "Adaugă grupă"}
					</h2>
					<button
						onClick={onClose}
						className="text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)]"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[var(--color-slate-500)]">
							Nume grupă
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[var(--color-slate-500)]">
							Descriere
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)] resize-none"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[var(--color-slate-500)]">
							Antrenor
						</label>
						<select
							value={coachId}
							onChange={(e) => setCoachId(e.target.value)}
							required
							className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
						>
							{coaches.length === 0 && (
								<option value="">
									Niciun antrenor disponibil
								</option>
							)}
							{coaches.map((c) => (
								<option key={c.id} value={c.id}>
									{formatFullName(c.firstName, c.lastName, c.email)}
								</option>
							))}
						</select>
					</div>

					{error && (
						<div className="text-xs text-red-500">{error}</div>
					)}

					<div className="flex justify-end gap-2 mt-2">
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
					</div>
				</form>
			</div>
		</div>
	);
}
