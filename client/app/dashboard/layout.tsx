"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { token, user, initialize, logout } = useAuthStore();
	const [mounted, setMounted] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		initialize();
		setMounted(true);
	}, [initialize]);

	useEffect(() => {
		if (mounted && !token) {
			router.push("/login");
		}
	}, [mounted, token, router]);

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
