"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { initials } from "@/lib/utils";
import { User } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { ROLE_LABELS as roleLabels } from "@/lib/constants/roles";

export default function ContPage() {
	const user = useAuthStore((s) => s.user);
	const setAuth = useAuthStore((s) => s.setAuth);
	const token = useAuthStore((s) => s.token);

	const [firstName, setFirstName] = useState(user?.firstName ?? "");
	const [lastName, setLastName] = useState(user?.lastName ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

	const handleSave = async () => {
		setError("");
		setSaving(true);
		try {
			const { data } = await api.patch<User>("/users/me", {
				firstName,
				lastName,
				email,
			});
			if (token) setAuth(token, data);
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-au putut salva modificările."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-[var(--color-ink-800)] text-2xl font-bold">
					Contul meu
				</h1>
				<p className="text-[var(--color-slate-500)] text-sm mt-1">
					Datele tale de cont
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
				{/* Avatar card */}
				<div className="bg-surface rounded-md border border-[var(--color-border-soft)] p-6 flex flex-col items-center text-center gap-4">
					<div className="w-24 h-24 rounded-full bg-[var(--color-blue-600)] text-white flex items-center justify-center text-3xl font-bold">
						{initials(fullName || "?")}
					</div>
					<div>
						<div className="font-bold text-[var(--color-ink-800)] text-lg">
							{fullName || user?.email}
						</div>
						<div className="text-[var(--color-slate-500)] text-sm mt-0.5">
							{user?.email}
						</div>
						<span className="inline-block mt-2 bg-[var(--color-blue-600)] text-white text-xs px-3 py-1 rounded-full font-medium">
							{user?.role
								? (roleLabels[user.role] ?? user.role)
								: ""}
						</span>
					</div>
					{user?.createdAt && (
						<div className="w-full border-t border-[var(--color-border-soft)] pt-4 flex flex-col gap-2 text-sm text-left">
							<div className="flex justify-between">
								<span className="text-[var(--color-slate-500)]">
									Cont creat
								</span>
								<span className="font-semibold text-[var(--color-ink-800)]">
									{new Date(
										user.createdAt,
									).toLocaleDateString("ro-RO")}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Edit card */}
				<div className="bg-surface rounded-md border border-[var(--color-border-soft)]">
					<div className="px-6 py-4 border-b border-[var(--color-border-soft)]">
						<h3 className="font-semibold text-[var(--color-ink-800)]">
							Date personale
						</h3>
					</div>
					<div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label htmlFor="cont-first-name" className="text-xs font-medium text-[var(--color-slate-500)]">
								Prenume
							</label>
							<input
								id="cont-first-name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-ink-800)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="cont-last-name" className="text-xs font-medium text-[var(--color-slate-500)]">
								Nume
							</label>
							<input
								id="cont-last-name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-ink-800)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>
						<div className="sm:col-span-2 flex flex-col gap-1.5">
							<label htmlFor="cont-email" className="text-xs font-medium text-[var(--color-slate-500)]">
								Email
							</label>
							<input
								id="cont-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								aria-describedby={error ? "cont-error" : undefined}
								className="border border-[var(--color-border-soft)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-ink-800)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>

						{error && (
							<div id="cont-error" role="alert" className="sm:col-span-2 text-xs text-red-500">
								{error}
							</div>
						)}

						<div className="sm:col-span-2 flex justify-end gap-3">
							<button
								onClick={handleSave}
								disabled={saving}
								className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
							>
								{saving
									? "Se salvează..."
									: saved
										? "✓ Salvat!"
										: "Salvează modificările"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
