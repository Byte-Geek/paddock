"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-[var(--color-silver-bg)] px-4">
			<div className="bg-surface rounded-md border border-[var(--color-border)] p-8 max-w-md w-full text-center flex flex-col items-center gap-3">
				<div className="text-5xl">⚠️</div>
				<h1 className="text-xl font-bold text-[var(--color-blue-900)]">
					A apărut o eroare
				</h1>
				<p className="text-sm text-[var(--color-slate-500)]">
					Ceva nu a funcționat corect. Poți încerca din nou sau te
					poți întoarce la pagina principală.
				</p>
				<div className="flex gap-2 mt-2">
					<button
						onClick={() => unstable_retry()}
						className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
					>
						Încearcă din nou
					</button>
					<Link
						href="/"
						className="border border-[var(--color-border)] hover:border-[var(--color-blue-600)] text-[var(--color-blue-600)] text-sm font-semibold px-4 py-2 rounded-md transition"
					>
						Pagina principală
					</Link>
				</div>
			</div>
		</div>
	);
}
