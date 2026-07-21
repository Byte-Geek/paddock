"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function AuthRefresher() {
	const token = useAuthStore((s) => s.token);
	const refresh = useAuthStore((s) => s.refresh);

	useEffect(() => {
		if (!token) return;

		const interval = setInterval(() => {
			refresh();
		}, REFRESH_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [token, refresh]);

	return null;
}
