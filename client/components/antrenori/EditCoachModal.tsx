"use client";

import { useState } from "react";
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/Modal";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import type { Coach } from "@/types";

interface EditCoachModalProps {
	coach: Coach;
	onClose: () => void;
	onUpdated: (coach: Coach) => void;
}

export default function EditCoachModal({
	coach,
	onClose,
	onUpdated,
}: EditCoachModalProps) {
	const [firstName, setFirstName] = useState(coach.firstName ?? "");
	const [lastName, setLastName] = useState(coach.lastName ?? "");
	const [email, setEmail] = useState(coach.email);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const { data } = await api.patch<Coach>(`/coaches/${coach.id}`, {
				firstName,
				lastName,
				email,
			});
			onUpdated(data);
			onClose();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut actualiza antrenorul."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit}>
				<ModalHeader title="Editează antrenor" onClose={onClose} />
				<ModalBody>
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label
									htmlFor="edit-coach-first-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Prenume
								</label>
								<input
									id="edit-coach-first-name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label
									htmlFor="edit-coach-last-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Nume
								</label>
								<input
									id="edit-coach-last-name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="edit-coach-email"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Email
							</label>
							<input
								id="edit-coach-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								aria-describedby={error ? "edit-coach-error" : undefined}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						{error && (
							<div
								id="edit-coach-error"
								role="alert"
								className="text-xs text-red-500"
							>
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
