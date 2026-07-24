"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Panel from "@/components/ui/Panel";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import { ROLE_LABELS as roleLabels } from "@/lib/constants/roles";
import { User } from "@/types";

const sections = [
	{ key: "date", label: "Date personale", icon: "user" },
	{ key: "securitate", label: "Securitate", icon: "lock" },
	{ key: "notif", label: "Notificări", icon: "bell" },
] as const;

const sectionIcons = {
	user: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="12" cy="8" r="4" />
			<path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
		</svg>
	),
	lock: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<rect x="5" y="11" width="14" height="9" />
			<path d="M8 11V8a4 4 0 0 1 8 0v3" />
		</svg>
	),
	bell: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</svg>
	),
};

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
			<div className="pb-6 border-b border-border-soft">
				<div className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
					Setări cont
				</div>
				<h1 className="text-[28px] sm:text-[32px] font-bold text-ink-800 tracking-[-0.02em]">
					Contul meu
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
				{/* side nav */}
				<nav className="hidden lg:flex flex-col bg-surface rounded-lg border border-border shadow-[var(--shadow-panel)] py-2 sticky top-6">
					{sections.map((s) => (
						<a
							key={s.key}
							href={`#${s.key}`}
							className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-500 border-l-2 border-transparent hover:bg-surface-subtle hover:text-ink-800 transition-colors duration-200 first:text-blue-600 first:border-blue-600 first:bg-blue-50 first:font-semibold"
						>
							{sectionIcons[s.icon]}
							{s.label}
						</a>
					))}
				</nav>

				<div className="flex flex-col gap-5 max-w-[760px]">
					{/* DATE PERSONALE */}
					<Panel
						title="Date personale"
						action={<Badge variant="blue">Editabil</Badge>}
					>
						<div id="date" className="flex items-center gap-4 mb-6 pb-6 border-b border-border-soft">
							<Avatar name={fullName || user?.email || "?"} size="lg" className="w-18 h-18 text-xl" />
							<div>
								<div className="font-bold text-ink-800 text-[15px]">
									{fullName || user?.email}
								</div>
								<div className="text-slate-500 text-[12.5px] mt-0.5">
									{user?.email}
								</div>
								<span className="inline-block mt-2 bg-blue-600 text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
									{user?.role ? (roleLabels[user.role] ?? user.role) : ""}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<label htmlFor="cont-first-name" className="text-[11px] font-medium text-slate-500">
									Prenume
								</label>
								<input
									id="cont-first-name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-blue-600 transition"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label htmlFor="cont-last-name" className="text-[11px] font-medium text-slate-500">
									Nume
								</label>
								<input
									id="cont-last-name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-blue-600 transition"
								/>
							</div>
							<div className="sm:col-span-2 flex flex-col gap-1.5">
								<label htmlFor="cont-email" className="text-[11px] font-medium text-slate-500">
									Email
								</label>
								<input
									id="cont-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									aria-describedby={error ? "cont-error" : undefined}
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:border-blue-600 transition"
								/>
							</div>

							{error && (
								<div id="cont-error" role="alert" className="sm:col-span-2 text-[12.5px] text-danger">
									{error}
								</div>
							)}
						</div>

						<div className="flex gap-3 mt-6 pt-5 border-t border-border-soft">
							<button
								onClick={handleSave}
								disabled={saving}
								className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200"
							>
								{saving ? "Se salvează..." : saved ? "✓ Salvat!" : "Salvează modificările"}
							</button>
						</div>
					</Panel>

					{/* SECURITATE */}
					<Panel
						title="Securitate"
						action={<Badge variant="gray">În curând</Badge>}
					>
						<div id="securitate" className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 pointer-events-none select-none">
							<div className="sm:col-span-2 flex flex-col gap-1.5">
								<label className="text-[11px] font-medium text-slate-500">
									Parola actuală
								</label>
								<input
									disabled
									type="password"
									placeholder="••••••••"
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[11px] font-medium text-slate-500">
									Parolă nouă
								</label>
								<input
									disabled
									type="password"
									placeholder="••••••••"
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[11px] font-medium text-slate-500">
									Confirmă parola
								</label>
								<input
									disabled
									type="password"
									placeholder="••••••••"
									className="border border-border rounded-lg px-3 py-2.5 text-sm text-ink-800"
								/>
							</div>
						</div>
						<p className="text-[12px] text-slate-500 mt-4">
							Schimbarea parolei va fi disponibilă într-o versiune viitoare.
						</p>
					</Panel>

					{/* NOTIFICARI */}
					<Panel
						title="Notificări"
						action={<Badge variant="gray">În curând</Badge>}
					>
						<div id="notif" className="flex flex-col opacity-50 pointer-events-none select-none">
							<div className="flex items-center justify-between py-3.5 border-b border-border-soft">
								<div>
									<div className="font-semibold text-ink-800 text-[13.5px]">
										Confirmări de la arbitri
									</div>
									<div className="text-[11.5px] text-slate-500 mt-0.5">Email</div>
								</div>
								<div className="w-[42px] h-[24px] rounded-full bg-blue-600 relative flex-shrink-0">
									<div className="absolute top-[2px] left-[20px] w-[20px] h-[20px] rounded-full bg-white" />
								</div>
							</div>
							<div className="flex items-center justify-between py-3.5">
								<div>
									<div className="font-semibold text-ink-800 text-[13.5px]">
										Rezumat săptămânal al federației
									</div>
									<div className="text-[11.5px] text-slate-500 mt-0.5">
										Email, lunea dimineața
									</div>
								</div>
								<div className="w-[42px] h-[24px] rounded-full bg-border relative flex-shrink-0">
									<div className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-surface" />
								</div>
							</div>
						</div>
					</Panel>
				</div>
			</div>
		</div>
	);
}
