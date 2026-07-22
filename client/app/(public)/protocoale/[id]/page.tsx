"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api, { fileUrl } from "@/lib/axios";
import { ProtocolTemplate, ProtocolTemplateDetail } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import LoadingState from "@/components/ui/LoadingState";

function BlankLine({ label, width }: { label: string; width?: string }) {
	return (
		<span className="inline-flex items-baseline gap-1 whitespace-nowrap">
			<span className="font-bold">{label}:</span>
			<span
				className={`border-b border-black inline-block h-3.5 ${width ?? "w-32"}`}
			/>
		</span>
	);
}

// Column proportions approximate the official FEI dressage-test sheet layout.
const COLUMN_WIDTHS = [
	"3%", // №
	"7%", // letters
	"28%", // element / movement
	"4%", // max score
	"4%", // given score (blank)
	"4%", // correction (blank)
	"6%", // coefficient
	"4%", // final score (blank)
	"26%", // judging criteria
	"6%", // remarks (blank)
];

export default function ProtocolViewPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const canManage = useCanManage();

	const [template, setTemplate] = useState<ProtocolTemplateDetail | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<ProtocolTemplateDetail>(
					`/protocol-templates/${params.id}`,
				);
				setTemplate(data);
			} catch (err) {
				console.error("Failed to load protocol template", err);
				setError("Nu s-a putut încărca protocolul.");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [params.id]);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !template) return;

		setError("");
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const { data } = await api.post<ProtocolTemplate>(
				`/protocol-templates/${template.id}/pdf`,
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } },
			);
			setTemplate((prev) =>
				prev
					? { ...prev, pdfUrl: data.pdfUrl, pdfFileName: data.pdfFileName }
					: prev,
			);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut încărca fișierul PDF."));
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleDelete = async () => {
		if (!template) return;
		if (!window.confirm(`Ștergi protocolul ${template.name}?`)) return;

		try {
			await api.delete(`/protocol-templates/${template.id}`);
			router.push("/protocoale");
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut șterge protocolul."));
		}
	};

	if (loading) {
		return <LoadingState />;
	}
	if (error || !template) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				{error || "Protocol negăsit."}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between print:hidden">
				<button
					onClick={() => router.push("/protocoale")}
					className="text-sm text-[#2a6aa6] hover:underline"
				>
					← Înapoi la protocoale
				</button>

				<div className="flex items-center gap-2">
					{canManage &&
						(template.active ? (
							<span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
								Activ — folosit de {template.categoryCount}{" "}
								{template.categoryCount === 1
									? "competiție"
									: "competiții"}
								, nu poate fi modificat sau șters
							</span>
						) : (
							<>
								<Link
									href={`/protocoale/${template.id}/edit`}
									className="text-sm text-[#2a6aa6] border border-[#b5d7f1] px-3 py-1.5 rounded-[8px] hover:bg-[#f1f7fc] transition"
								>
									✏️ Editează
								</Link>
								<button
									onClick={handleDelete}
									className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-[8px] hover:bg-red-50 transition"
								>
									🗑️ Șterge
								</button>
							</>
						))}
				</div>
			</div>

			{/* Original PDF — exact copy, kept alongside the structured data above */}
			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 flex items-center justify-between print:hidden">
				<div className="text-sm">
					<div className="font-semibold text-[#0e1f33]">
						Document PDF original
					</div>
					{template.pdfUrl ? (
						<div className="text-[#6b7d92] text-xs mt-0.5">
							{template.pdfFileName}
						</div>
					) : (
						<div className="text-[#8896b3] text-xs mt-0.5">
							Niciun fișier încărcat încă.
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{template.pdfUrl && (
						<a
							href={fileUrl(template.pdfUrl)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-[#2a6aa6] border border-[#b5d7f1] px-3 py-1.5 rounded-[8px] hover:bg-[#f1f7fc] transition"
						>
							📄 Deschide PDF
						</a>
					)}
					{canManage && (
						<>
							<input
								ref={fileInputRef}
								type="file"
								accept="application/pdf"
								onChange={handleUpload}
								className="hidden"
							/>
							<button
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
								className="text-sm text-[#6b7d92] border border-[#e2e8f0] px-3 py-1.5 rounded-[8px] hover:bg-[#f1f7fc] transition disabled:opacity-50"
							>
								{uploading
									? "Se încarcă..."
									: template.pdfUrl
										? "Înlocuiește PDF"
										: "⬆️ Încarcă PDF"}
							</button>
						</>
					)}
				</div>
			</div>

			<div
				className="bg-white border border-black mx-auto w-full max-w-[900px] text-[11px] leading-tight text-black"
				style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
			>
				
				<div className="flex items-start justify-between p-3 border-b-2 border-black">
					<div>
						<div className="text-base font-bold uppercase">
							{template.name}
						</div>
						<div className="text-[11px]">
							{template.compositionYear
								? `${template.compositionYear} г.`
								: ""}
							{template.revisionYear
								? ` (редакция ${template.revisionYear} г.)`
								: ""}
							{template.level ? ` — ${template.level}` : ""}
						</div>
					</div>

					
				</div>


				
				<table
					className="w-full border-collapse"
					style={{ tableLayout: "fixed" }}
				>
					<colgroup>
						{COLUMN_WIDTHS.map((w, i) => (
							<col key={i} style={{ width: w }} />
						))}
					</colgroup>
					<thead>
						<tr className="bg-[#f0f0f0]">
							<th
								className="border border-black p-0.5 text-[9px] font-bold"
								rowSpan={2}
							>
								№
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold"
								rowSpan={2}
							>
								Буквы
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold"
								rowSpan={2}
							>
								Упражнение
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold [writing-mode:vertical-rl] rotate-180"
								rowSpan={2}
							>
								Оценки
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold [writing-mode:vertical-rl] rotate-180"
								rowSpan={2}
							>
								Оценка
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold [writing-mode:vertical-rl] rotate-180"
								rowSpan={2}
							>
								Поправка
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold [writing-mode:vertical-rl] rotate-180"
								rowSpan={2}
							>
								Коэффициент
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold [writing-mode:vertical-rl] rotate-180"
								rowSpan={2}
							>
								Итогова оценка
							</th>
							<th
								className="border border-black p-0.5 text-[9px] font-bold"
								colSpan={2}
							>
								Оценивается / Замечания
							</th>
						</tr>
						<tr className="bg-[#f0f0f0]">
							<th className="border border-black p-0.5 text-[9px] font-bold">
								Оценивается
							</th>
							<th className="border border-black p-0.5 text-[9px] font-bold">
								Замечания
							</th>
						</tr>
					</thead>
					<tbody>
						{template.elements.length === 0 ? (
							<tr>
								<td
									colSpan={10}
									className="border border-black p-3 text-center text-[#8896b3]"
								>
									Niciun element definit încă.
								</td>
							</tr>
						) : (
							template.elements.map((el) => (
								<tr key={el.id}>
									<td className="border border-black p-1 text-center font-bold align-top">
										{el.order}
									</td>
									<td className="border border-black p-1 align-top whitespace-pre-line font-bold">
										{el.letters || ""}
									</td>
									<td className="border border-black p-1 align-top whitespace-pre-line">
										{el.name}
									</td>
									<td className="border border-black p-1 align-top text-center">
										{el.maxScore}
									</td>
									<td className="border border-black p-1 align-top">
										{" "}
									</td>
									<td className="border border-black p-1 align-top">
										{" "}
									</td>
									<td className="border border-black p-1 align-top text-center">
										{Number(el.coefficient) === 2
											? "2"
											: ""}
									</td>
									<td className="border border-black p-1 align-top">
										{" "}
									</td>
									<td className="border border-black p-1 align-top whitespace-pre-line text-[10px]">
										{el.judgingCriteria || ""}
									</td>
									<td className="border border-black p-1 align-top">
										{" "}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>

				{/* Signature line — matches the bottom of the paper form */}
				{template.elements.length > 0 && (
					<div className="p-3 flex justify-between text-[11px]">
						<BlankLine label="Organizatori" width="w-56" />
						<BlankLine label="Semnătura arbitrului" width="w-56" />
					</div>
				)}
			</div>
		</div>
	);
}
