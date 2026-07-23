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

interface AddCoachModalProps {
	onClose: () => void;
	onCreated: (coach: Coach) => void;
}

export default function AddCoachModal({
	onClose,
	onCreated,
}: AddCoachModalProps) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const { data } = await api.post<Coach>("/coaches", {
				firstName,
				lastName,
				email,
				password,
			});
			onCreated(data);
			onClose();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut adăuga antrenorul."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit}>
				<ModalHeader title="Adaugă antrenor" onClose={onClose} />
				<ModalBody>
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label
									htmlFor="add-coach-first-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Prenume
								</label>
								<input
									id="add-coach-first-name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label
									htmlFor="add-coach-last-name"
									className="text-xs font-medium text-[var(--color-slate-500)]"
								>
									Nume
								</label>
								<input
									id="add-coach-last-name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="add-coach-email"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Email
							</label>
							<input
								id="add-coach-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								aria-describedby={error ? "add-coach-error" : undefined}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="add-coach-password"
								className="text-xs font-medium text-[var(--color-slate-500)]"
							>
								Parolă
							</label>
							<input
								id="add-coach-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
						</div>

						{error && (
							<div
								id="add-coach-error"
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
						{saving ? "Se salvează..." : "Adaugă"}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
