"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data } = await api.post("/auth/login", { email, password });
			setAuth(data.access_token, data.user);
			router.push("/dashboard");
		} catch {
			setError("Email sau parolă incorectă.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen grid lg:grid-cols-[1fr_1.05fr] bg-[var(--color-ink-900)]">
			{/* LEFT · brand panel */}
			<div className="hidden lg:flex flex-col justify-between p-13 relative text-white bg-[var(--color-ink-900)]">
				<div className="flex items-center gap-3 text-sm tracking-[0.16em]">
					<span className="inline-block w-3 h-3 border-[1.5px] border-[var(--color-blue-300)] rotate-45" />
					PADDOCK
				</div>

				<div className="max-w-[440px]">
					<div className="text-xs tracking-[0.2em] uppercase text-[var(--color-blue-300)] mb-4">
						Platformă de management · competiții de echitație
					</div>
					<h1 className="text-5xl leading-[1.02] mb-4 font-bold">
						Dresaj și obstacole,
						<br />
						de la înscriere
						<br />
						la protocol.
					</h1>
					<p className="text-sm leading-relaxed text-[var(--color-blue-100)]">
						Sportivi, antrenori, secretari și arbitri — un singur loc
						pentru organizarea evenimentelor, notarea pe protocoale
						oficiale și publicarea rezultatelor.
					</p>
				</div>

				<div className="border-t border-white/15 pt-5" />
			</div>

			{/* RIGHT · form */}
			<div className="flex items-center justify-center p-6 lg:p-12 bg-[var(--color-surface)]">
				<div className="w-full max-w-sm">
					<div className="lg:hidden flex items-center gap-3 text-[var(--color-ink-900)] text-sm tracking-[0.16em] mb-10 justify-center">
						<span className="inline-block w-3 h-3 border-[1.5px] border-[var(--color-blue-600)] rotate-45" />
						PADDOCK
					</div>

					<div className="text-xs tracking-[0.16em] uppercase text-[var(--color-blue-600)]">
						Autentificare
					</div>
					<h2 className="text-[var(--color-ink-900)] text-3xl font-bold mt-2 mb-1">
						Bine ai revenit
					</h2>
					<p className="text-[var(--color-slate-500)] text-sm mb-7">
						Intră în cont pentru a-ți gestiona competițiile și
						rezultatele.
					</p>

					<form onSubmit={handleLogin} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label htmlFor="login-email" className="text-[var(--color-ink-900)] text-sm font-medium">
								Email
							</label>
							<input
								id="login-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="exemplu@paddock.md"
								required
								autoComplete="username"
								aria-invalid={!!error}
								className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-ink-900)] text-sm placeholder:text-[var(--color-slate-500)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label htmlFor="login-password" className="text-[var(--color-ink-900)] text-sm font-medium">
								Parolă
							</label>
							<input
								id="login-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								autoComplete="current-password"
								aria-invalid={!!error}
								aria-describedby={error ? "login-error" : undefined}
								className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-ink-900)] text-sm placeholder:text-[var(--color-slate-500)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>

						<label className="flex items-center gap-2.5 text-sm text-[var(--color-slate-500)] mt-0.5">
							<input
								type="checkbox"
								className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] accent-[var(--color-blue-600)]"
							/>
							Ține-mă minte pe acest dispozitiv
						</label>

						{error && (
							<div id="login-error" role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition mt-2"
						>
							{loading ? "Se autentifică..." : "Intră în cont"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
