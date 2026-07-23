"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { initials } from "@/lib/utils";
import { ROLE_LABELS as roleLabels } from "@/lib/constants/roles";

interface NavbarProps {
	onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
	const router = useRouter();
	const { token, user, logout } = useAuthStore();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	const handleLogin = () => {
		router.push("/login");
	};

	return (
		<header className="h-[64px] bg-[var(--color-blue-900)] text-white flex items-center px-5 gap-3.5 z-30 flex-shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.08),0_8px_24px_-16px_rgba(14,39,64,0.4)]">
			{/* Toggle */}
			<button
				onClick={onToggleSidebar}
				className="w-[38px] h-[38px] grid place-items-center border border-white/10 rounded-[6px] hover:bg-surface/8 transition flex-shrink-0"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>

			{/* Brand */}
			<button onClick={() => router.push("/")}>
				<div className="flex items-center gap-3 font-bold text-[18px] tracking-[-0.01em]">
					<div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[var(--color-blue-300)] to-white grid place-items-center text-[var(--color-ink-900)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.15)]">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M6 4c-2 2-3 5-3 9s2 7 3 7" />
							<path d="M18 4c2 2 3 5 3 9s-2 7-3 7" />
							<circle
								cx="6"
								cy="20"
								r="1.4"
								fill="currentColor"
							/>
							<circle
								cx="18"
								cy="20"
								r="1.4"
								fill="currentColor"
							/>
						</svg>
					</div>
					<div>
						Paddock
						<small className="block font-normal text-[11px] text-white/55 uppercase tracking-[0.08em] mt-[1px]">
							Școala Sportivă Republicană
						</small>
					</div>
				</div>
			</button>

			<div className="flex-1" />

			{/* Search - only for authenticated users */}
			{token && (
				<div
					className="flex items-center gap-2 bg-surface/6 border border-white/8 rounded-full px-3 py-[7px] w-[320px] text-white/75 hover:bg-surface/10 transition cursor-text"
					onClick={(e) =>
						(
							e.currentTarget.querySelector(
								"input",
							) as HTMLInputElement
						)?.focus()
					}
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<input
						placeholder="Caută sportivi, competiții, grupe…"
						className="bg-transparent border-0 outline-none text-white text-[13px] flex-1 min-w-0 placeholder:text-white/45"
					/>
					<kbd className="font-mono text-[10px] px-1.5 py-[1px] rounded bg-surface/10 text-white/70 border border-white/8">
						⌘K
					</kbd>
				</div>
			)}

			{/* Bell - only for authenticated users */}
			{token && (
				<button className="w-[38px] h-[38px] grid place-items-center text-white/85 rounded-[6px] hover:bg-surface/8 relative transition">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
						<path d="M13.73 21a2 2 0 0 1-3.46 0" />
					</svg>
					<span className="absolute top-2 right-[9px] w-[7px] h-[7px] bg-[#ff7a59] rounded-full shadow-[0_0_0_2px_var(--color-blue-900)]" />
				</button>
			)}

			{/* Auth section */}
			{token ? (
				/* Avatar + dropdown for authenticated users */
				<div ref={menuRef} className="relative">
					<button
						onClick={() => setMenuOpen((o) => !o)}
						className="flex items-center gap-2.5 bg-transparent border-0 text-white px-2.5 py-1 pr-[10px] pl-1 rounded-full hover:bg-surface/8 transition"
					>
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-white to-[var(--color-blue-300)] text-[var(--color-ink-900)] grid place-items-center font-bold text-[14px]">
							{initials(user?.firstName || "")}
						</div>
						<div className="text-left">
							<div className="text-[13px] font-semibold leading-none">
								{user ? `${user.firstName} ${user.lastName}` : ""}
							</div>
							<div className="text-[10px] uppercase tracking-[0.08em] text-white/55 font-semibold mt-[1px]">
								{user?.role ? roleLabels[user.role] : ""}
							</div>
						</div>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="opacity-60"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>

					{menuOpen && (
						<div className="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-surface rounded-lg shadow-[0_20px_40px_-16px_rgba(14,39,64,0.22),0_4px_8px_rgba(14,39,64,0.06)] border border-[var(--color-border)] overflow-hidden z-50 animate-[menu-in_0.14s_ease-out]">
							{/* Head */}
							<div className="p-4 border-b border-[var(--color-border-soft)] grid grid-cols-[44px_1fr] gap-3 items-center">
								<div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-blue-300)] to-[var(--color-blue-100)] text-[var(--color-ink-900)] grid place-items-center font-bold text-base">
									{initials(user?.firstName || "")}
								</div>
								<div>
									<div className="font-bold text-[14px] text-[var(--color-blue-900)]">
										{user ? `${user.firstName} ${user.lastName}` : ""}
									</div>
									<div className="text-[12px] text-[var(--color-slate-500)]">
										{user?.email}
									</div>
									<span className="mt-1 inline-block text-[10px] font-bold tracking-[0.1em] text-[var(--color-blue-800)] bg-[var(--color-blue-100)] px-[7px] py-[2px] rounded uppercase">
										{user?.role ? roleLabels[user.role] : ""}
									</span>
								</div>
							</div>

							{/* Items */}
							<div className="p-1.5">
								{[
									{
										label: "Cont",
										href: "/cont",
										icon: (
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
												<circle cx="12" cy="7" r="4" />
											</svg>
										),
									},
									{
										label: "Setări cont",
										href: "/setari",
										icon: (
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
											>
												<circle cx="12" cy="12" r="3" />
												<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
											</svg>
										),
									},
								].map((item) => (
									<button
										key={item.href}
										onClick={() => {
											setMenuOpen(false);
											router.push(item.href);
										}}
										className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[6px] text-[13px] text-[var(--color-blue-900)] hover:bg-[var(--color-blue-50)] hover:text-[var(--color-blue-800)] transition text-left"
									>
										{item.icon} {item.label}
									</button>
								))}

								<div className="h-px bg-[var(--color-border-soft)] my-1" />

								<button
									onClick={() => {
										setMenuOpen(false);
										handleLogout();
									}}
									className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[6px] text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition text-left"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
										<polyline points="16 17 21 12 16 7" />
										<line x1="21" y1="12" x2="9" y2="12" />
									</svg>
									Deconectare
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				/* Login button for guest users */
				// <button
				// 	onClick={handleLogin}
				// 	className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white font-semibold rounded-lg px-6 py-2 text-sm transition"
				// >
				// 	Autentificare
				// </button>
				<></>
			)}
		</header>
	);
}
