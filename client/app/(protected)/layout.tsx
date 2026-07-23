"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { initialize } = useAuthStore();
	const [mounted, setMounted] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		initialize();
		setMounted(true);
	}, [initialize]);

	if (!mounted) return null;

	const handleToggleSidebar = () => {
		if (window.matchMedia("(min-width: 768px)").matches) {
			setCollapsed((p) => !p);
		} else {
			setMobileOpen((p) => !p);
		}
	};

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Navbar onToggleSidebar={handleToggleSidebar} />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar
					collapsed={collapsed}
					mobileOpen={mobileOpen}
					onCloseMobile={() => setMobileOpen(false)}
				/>
				<main className="flex-1 overflow-auto bg-[var(--color-blue-50)] p-4 sm:p-6 lg:p-8">
					{children}
				</main>
			</div>
		</div>
	);
}
