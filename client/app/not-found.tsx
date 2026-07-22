import Link from "next/link";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] px-4">
			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-8 max-w-md w-full text-center flex flex-col items-center gap-3">
				<div className="text-5xl font-bold text-[#2a6aa6]">404</div>
				<h1 className="text-xl font-bold text-[#0e1f33]">
					Pagina nu a fost găsită
				</h1>
				<p className="text-sm text-[#6b7d92]">
					Pagina pe care o cauți nu există sau a fost mutată.
				</p>
				<Link
					href="/"
					className="mt-2 bg-[#2a6aa6] hover:bg-[#205280] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition"
				>
					Pagina principală
				</Link>
			</div>
		</div>
	);
}
