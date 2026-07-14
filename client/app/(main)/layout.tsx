"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { initialize } = useAuthStore();
	const [mounted, setMounted] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		initialize();
		setMounted(true);
	}, [initialize]);

	if (!mounted) return null;

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Navbar onToggleSidebar={() => setCollapsed((p) => !p)} />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar collapsed={collapsed} />
				<main className="flex-1 overflow-auto bg-[#f3f6fa] p-8">
					{children}
				</main>
			</div>
		</div>
	);
}
