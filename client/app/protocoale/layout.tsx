"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(false);

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
