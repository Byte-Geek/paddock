"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Coach, Group } from "@/types";

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
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut salva grupa.";
			setError(Array.isArray(message) ? message.join(", ") : message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-md p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold text-[#0f1729]">
						{group ? "Editează grupă" : "Adaugă grupă"}
					</h2>
					<button
						onClick={onClose}
						className="text-[#8896b3] hover:text-[#0f1729]"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#8896b3]">
							Nume grupă
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#8896b3]">
							Descriere
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb] resize-none"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#8896b3]">
							Antrenor
						</label>
						<select
							value={coachId}
							onChange={(e) => setCoachId(e.target.value)}
							required
							className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
						>
							{coaches.length === 0 && (
								<option value="">
									Niciun antrenor disponibil
								</option>
							)}
							{coaches.map((c) => (
								<option key={c.id} value={c.id}>
									{`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
										c.email}
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
							className="px-4 py-2 rounded-lg text-sm font-semibold text-[#8896b3] hover:bg-[#f1f7fc]"
						>
							Anulează
						</button>
						<button
							type="submit"
							disabled={saving || !coachId}
							className="bg-[#4a7adb] hover:bg-[#3a6acb] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							{saving ? "Se salvează..." : "Salvează"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
