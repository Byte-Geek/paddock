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
		<div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] px-4">
			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-8 max-w-md w-full text-center flex flex-col items-center gap-3">
				<div className="text-5xl">⚠️</div>
				<h1 className="text-xl font-bold text-[#0e1f33]">
					A apărut o eroare
				</h1>
				<p className="text-sm text-[#6b7d92]">
					Ceva nu a funcționat corect. Poți încerca din nou sau te
					poți întoarce la pagina principală.
				</p>
				<div className="flex gap-2 mt-2">
					<button
						onClick={() => unstable_retry()}
						className="bg-[#2a6aa6] hover:bg-[#205280] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						Încearcă din nou
					</button>
					<Link
						href="/"
						className="border border-[#e2e8f0] hover:border-[#2a6aa6] text-[#2a6aa6] text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						Pagina principală
					</Link>
				</div>
			</div>
		</div>
	);
}
