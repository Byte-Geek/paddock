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
		roles: ["ADMIN", "MODERATOR"],
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
			className={`h-full bg-[#0e2740] text-white flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[222px]"}`}
		>
			{/* Scroll area */}
			<div className="flex-1 overflow-y-auto px-3 py-[18px] scrollbar-thin">
				{filteredNavSections.map((section: any, i: number) => (
					<div key={i}>
						{collapsed ? (
							i > 0 && (
								<div className="h-px bg-white/10 my-2 mx-1.5" />
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
									className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[14px] font-medium transition relative mb-0.5
                  ${collapsed ? "justify-center px-0" : ""}
                  ${
						active
							? "bg-gradient-to-r from-[#1a4368] to-[#205280] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
							: "text-white/78 hover:bg-white/6 hover:text-white"
					}`}
								>
									{active && (
										<span className="absolute left-[-12px] top-2 bottom-2 w-[3px] bg-[#6cb0e6] rounded-r-[3px]" />
									)}
									<span className="w-5 h-5 flex-shrink-0 grid place-items-center">
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
											<span className="bg-[#6cb0e6] text-[#0e2740] text-[10px] font-bold px-1.5 py-[1px] rounded-full">
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
			<div className="px-3 py-3 border-t border-white/6">
				{token ? (
					<button
						onClick={handleLogout}
						className="w-full bg-[#dc2626] text-white border-0 px-3 py-[8px] rounded-[10px] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#b91c1c] transition"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" />
							<line x1="21" y1="12" x2="9" y2="12" />
						</svg>
						{!collapsed && "Deconectare"}
					</button>
				) : (
					<button
						onClick={handleLogin}
						className="w-full bg-[#4a7adb] text-white border-0 px-3 py-[8px] rounded-[10px] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#3a6acb] transition"
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
				)}
			</div>
		</aside>
	);
}
