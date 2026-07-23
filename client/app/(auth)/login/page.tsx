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
		<div className="min-h-screen bg-[var(--color-ink-900)] flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/** logo */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-ink-900)] border border-[var(--color-ink-700)] mb-4">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							strokeWidth="1.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M6 4c-2 2-3 5-3 9s2 7 3 7" />
							<path d="M18 4c2 2 3 5 3 9s-2 7-3 7" />
							<circle cx="6" cy="20" r="1.4" fill="white" />
							<circle cx="18" cy="20" r="1.4" fill="white" />
							<path
								d="M12 8l2 4-2 1-2-1z"
								fill="white"
								opacity=".55"
							/>
						</svg>
					</div>
					<h1 className="text-white text-2xl font-bold">Paddock</h1>
					{/* <p className="text-[var(--color-slate-500)] text-sm mt-1">
						Școala Sportivă Republicană
					</p> */}
				</div>

				{/* Card */}
				<div className="bg-[var(--color-ink-900)] border border-[var(--color-ink-700)] rounded-2xl p-8">
					<h2 className="text-white text-xl font-semibold mb-1">
						Bun venit
					</h2>
					<p className="text-[var(--color-slate-500)] text-sm mb-6">
						Autentifică-te pentru a continua
					</p>

					<form
						onSubmit={handleLogin}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-col gap-1.5">
							<label className="text-[var(--color-slate-500)] text-sm font-medium">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="exemplu@paddock.md"
								required
								className="bg-[var(--color-ink-900)] border border-[var(--color-ink-700)] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[var(--color-slate-500)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-[var(--color-slate-500)] text-sm font-medium">
								Parolă
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="bg-[var(--color-ink-900)] border border-[var(--color-ink-700)] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[var(--color-slate-500)] focus:outline-none focus:border-[var(--color-blue-600)] transition"
							/>
						</div>

						{error && (
							<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition mt-2"
						>
							{loading ? "Se autentifică..." : "Autentifică-te"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
