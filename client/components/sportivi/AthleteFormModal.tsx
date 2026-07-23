"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Athlete, Group } from "@/types";
import { getErrorMessage } from "@/lib/error";

interface AthleteFormModalProps {
	athlete: Athlete | null;
	onClose: () => void;
	onSaved: (athlete: Athlete) => void;
}

export default function AthleteFormModal({
	athlete,
	onClose,
	onSaved,
}: AthleteFormModalProps) {
	const [firstName, setFirstName] = useState(athlete?.firstName ?? "");
	const [lastName, setLastName] = useState(athlete?.lastName ?? "");
	const [email, setEmail] = useState(athlete?.email ?? "");
	const [password, setPassword] = useState("");
	const [groupId, setGroupId] = useState("");
	const [groups, setGroups] = useState<Group[]>([]);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (athlete) return;
		const loadGroups = async () => {
			try {
				const { data } = await api.get<Group[]>("/groups");
				setGroups(data);
			} catch (error) {
				console.error("Failed to load groups", error);
			}
		};

		loadGroups();
	}, [athlete]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const { data } = athlete
				? await api.patch<Athlete>(`/athletes/${athlete.id}`, {
						firstName,
						lastName,
						email,
					})
				: await api.post<Athlete>("/athletes", {
						firstName,
						lastName,
						email,
						password,
						groupId: groupId || undefined,
					});
			onSaved(data);
			onClose();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva sportivul."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
			<div className="bg-surface rounded-2xl w-full max-w-md p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold text-[var(--color-ink-800)]">
						{athlete ? "Editează sportiv" : "Adaugă sportiv"}
					</h2>
					<button
						onClick={onClose}
						className="text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)]"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[var(--color-slate-500)]">
								Prenume
							</label>
							<input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[var(--color-slate-500)]">
								Nume
							</label>
							<input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[var(--color-slate-500)]">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
						/>
					</div>

					{!athlete && (
						<>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-[var(--color-slate-500)]">
									Parolă
								</label>
								<input
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
									minLength={6}
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-[var(--color-slate-500)]">
									Grupă (opțional)
								</label>
								<select
									value={groupId}
									onChange={(e) =>
										setGroupId(e.target.value)
									}
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								>
									<option value="">Fără grupă</option>
									{groups.map((g) => (
										<option key={g.id} value={g.id}>
											{g.name}
										</option>
									))}
								</select>
							</div>
						</>
					)}

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
							disabled={saving}
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
