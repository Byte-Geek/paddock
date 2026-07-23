"use client";

import { useEffect, useState } from "react";
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/Modal";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import type { Athlete, Group } from "@/types";

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
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit}>
				<ModalHeader
					title={athlete ? "Editează sportiv" : "Adaugă sportiv"}
					onClose={onClose}
				/>
				<ModalBody>
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label
									htmlFor="athlete-first-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Prenume
								</label>
								<input
									id="athlete-first-name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label
									htmlFor="athlete-last-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Nume
								</label>
								<input
									id="athlete-last-name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="athlete-email"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Email
							</label>
							<input
								id="athlete-email"
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
									<label
										htmlFor="athlete-password"
										className="text-xs font-medium text-[var(--color-slate-500)]"
									>
										Parolă
									</label>
									<input
										id="athlete-password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={6}
										className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
									/>
								</div>

								<div className="flex flex-col gap-1">
									<label
										htmlFor="athlete-group"
										className="text-xs font-medium text-[var(--color-slate-500)]"
									>
										Grupă (opțional)
									</label>
									<select
										id="athlete-group"
										value={groupId}
										onChange={(e) => setGroupId(e.target.value)}
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
