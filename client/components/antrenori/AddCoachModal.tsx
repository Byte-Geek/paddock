"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Coach } from "@/types";

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
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut adăuga antrenorul.";
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
						Adaugă antrenor
					</h2>
					<button
						onClick={onClose}
						className="text-[#8896b3] hover:text-[#0f1729]"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#8896b3]">
								Prenume
							</label>
							<input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-[#8896b3]">
								Nume
							</label>
							<input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#8896b3]">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#8896b3]">
							Parolă
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
							className="border border-[#e8ecf5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a7adb]"
						/>
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
							disabled={saving}
							className="bg-[#4a7adb] hover:bg-[#3a6acb] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							{saving ? "Se salvează..." : "Adaugă"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
