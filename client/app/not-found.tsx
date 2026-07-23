import Link from "next/link";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-[var(--color-silver-bg)] px-4">
			<div className="bg-surface rounded-md border border-[var(--color-border)] p-8 max-w-md w-full text-center flex flex-col items-center gap-3">
				<div className="text-5xl font-bold text-[var(--color-blue-600)]">404</div>
				<h1 className="text-xl font-bold text-[var(--color-blue-900)]">
					Pagina nu a fost găsită
				</h1>
				<p className="text-sm text-[var(--color-slate-500)]">
					Pagina pe care o cauți nu există sau a fost mutată.
				</p>
				<Link
					href="/"
					className="mt-2 bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
				>
					Pagina principală
				</Link>
			</div>
		</div>
	);
}
