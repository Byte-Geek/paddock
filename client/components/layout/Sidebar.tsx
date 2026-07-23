"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface SidebarProps {
	collapsed: boolean;
}

const dashboardIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
	</svg>
);

const evenimenteIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);

const protocoaleIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="16" y1="13" x2="8" y2="13" />
		<line x1="16" y1="17" x2="8" y2="17" />
	</svg>
);

const calculatorIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<rect x="4" y="2" width="16" height="20" rx="2" />
		<line x1="8" y1="6" x2="16" y2="6" />
		<line x1="8" y1="10" x2="10" y2="10" />
		<line x1="14" y1="10" x2="16" y2="10" />
		<line x1="8" y1="14" x2="10" y2="14" />
		<line x1="14" y1="14" x2="16" y2="14" />
		<line x1="8" y1="18" x2="10" y2="18" />
		<line x1="14" y1="18" x2="16" y2="18" />
	</svg>
);

const profileIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const groupsIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
);

const athletesIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const competitionsIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
		<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
		<path d="M4 22h16" />
		<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
		<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
		<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
	</svg>
);

const statsIcon = (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<line x1="18" y1="20" x2="18" y2="10" />
		<line x1="12" y1="20" x2="12" y2="4" />
		<line x1="6" y1="20" x2="6" y2="14" />
	</svg>
);

const generalSection = {
	label: "General",
	items: [
		{ href: "/dashboard", label: "Dashboard", icon: dashboardIcon },
		{ href: "/evenimente", label: "Evenimente", icon: evenimenteIcon },
	],
};

const resourceSection = {
	label: "Resurse",
	items: [
		{ href: "/protocoale", label: "Protocoale", icon: protocoaleIcon },
		{ href: "/calculator", label: "Calculator", icon: calculatorIcon },
	],
};

const navSections = [
	generalSection,
	{
		label: "Moderator",
		roles: ["ADMIN"],
		items: [
			{ href: "/profil", label: "Profil", icon: profileIcon },
			{ href: "/antrenori", label: "Antrenori", icon: groupsIcon },
			{ href: "/grupe", label: "Grupe", icon: groupsIcon },
			{ href: "/sportivi", label: "Sportivi", icon: athletesIcon },
			{
				href: "/competitii",
				label: "Competiții",
				icon: competitionsIcon,
			},
			{ href: "/statistici", label: "Statistici", icon: statsIcon },
		],
	},
	{
		label: "Antrenor",
		roles: ["COACH"],
		items: [
			{ href: "/profil", label: "Profil", icon: profileIcon },
			{ href: "/grupe", label: "Grupele mele", icon: groupsIcon },
			{ href: "/sportivi", label: "Sportivi", icon: athletesIcon },
			{
				href: "/competitii",
				label: "Competiții",
				icon: competitionsIcon,
			},
			{ href: "/statistici", label: "Statistici", icon: statsIcon },
		],
	},
	{
		label: "Sportiv",
		roles: ["ATHLETE"],
		items: [
			{ href: "/profil", label: "Profil", icon: profileIcon },
			{
				href: "/competitii",
				label: "Competiții",
				icon: competitionsIcon,
			},
			{ href: "/statistici", label: "Statistici", icon: statsIcon },
		],
	},
	resourceSection,
];

export default function Sidebar({ collapsed }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { token, user, logout } = useAuthStore();

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	const handleLogin = () => {
		router.push("/login");
	};

	const filteredNavSections = navSections.filter((section: any) => {
		if (!section.roles) return true;
		return section.roles.includes(user?.role);
	});

	return (
		<aside
			className={`h-full bg-[var(--color-ink-900)] border-r border-white/[0.06] text-white flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[222px]"}`}
		>
			{/* Scroll area */}
			<div className="flex-1 overflow-y-auto px-3 py-[18px] scrollbar-thin">
				{filteredNavSections.map((section: any, i: number) => (
					<div key={i}>
						{collapsed ? (
							i > 0 && (
								<div className="h-px bg-surface/10 my-2 mx-1.5" />
							)
						) : (
							<div
								className={`text-[10px] tracking-[0.12em] text-white/40 uppercase font-semibold pb-1.5 px-3 ${i === 0 ? "pt-0" : "pt-[14px]"}`}
							>
								{section.label}
							</div>
						)}
						{section.items.map((item: any) => {
							const active = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									title={collapsed ? item.label : undefined}
									className={`w-full flex items-center gap-3 pl-[13px] pr-3 py-[9px] text-[13.5px] transition relative mb-0.5 border-l-2
                  ${collapsed ? "justify-center px-0 border-l-0" : ""}
                  ${
						active
							? "border-l-[var(--color-blue-300)] bg-[var(--color-blue-300)]/[0.12] text-white font-semibold"
							: "border-l-transparent text-white/70 hover:bg-surface/[0.05] hover:text-white"
					}`}
								>
									<span className="w-[18px] h-[18px] flex-shrink-0 grid place-items-center opacity-85">
										{item.icon}
									</span>
									{!collapsed && (
										<span className="flex-1">
											{item.label}
										</span>
									)}
									{!collapsed &&
										"badge" in item &&
										item.badge && (
											<span className="bg-[var(--color-blue-300)] text-[var(--color-ink-900)] text-[10px] font-bold px-1.5 py-[1px] rounded-full">
												{item.badge}
											</span>
										)}
								</Link>
							);
						})}
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="border-t border-white/6">
				{token ? (
					<div
						className={`grid px-3 transition-[grid-template-rows] duration-200 ease-out ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
					>
						<div className="overflow-hidden">
							<button
								onClick={handleLogout}
								className={`w-full bg-[var(--color-danger)] text-white border-0 px-3 py-[8px] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 my-3 hover:bg-[var(--color-danger)]/90 transition-opacity duration-200 ease-out ${collapsed ? "opacity-0" : "opacity-100"}`}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="flex-shrink-0"
								>
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
									<polyline points="16 17 21 12 16 7" />
									<line x1="21" y1="12" x2="9" y2="12" />
								</svg>
								Deconectare
							</button>
						</div>
					</div>
				) : (
					<div className="px-3 py-3">
						<button
							onClick={handleLogin}
							className="w-full bg-[var(--color-blue-600)] text-white border-0 px-3 py-[8px] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--color-blue-800)] transition"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
								<polyline points="10 17 15 12 10 7" />
								<line x1="15" y1="12" x2="3" y2="12" />
							</svg>
							{!collapsed && "Autentificare"}
						</button>
					</div>
				)}
			</div>
		</aside>
	);
}
