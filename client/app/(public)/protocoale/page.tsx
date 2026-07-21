"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import ProtocolFormModal from "@/components/protocoale/ProtocolFormModal";
import api from "@/lib/axios";
import { ProtocolTemplate } from "@/types";

const algorithmLabels: Record<string, string> = {
	SUM: "Sumă",
	AVERAGE: "Medie",
	AVERAGE_DROP_HIGH_LOW: "Medie fără extreme",
	WEIGHTED_SUM: "Sumă ponderată",
};

export default function ProtocoalePage() {
	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [adding, setAdding] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<ProtocolTemplate | null>(null);
	const [actionError, setActionError] = useState("");

	useEffect(() => {
		const loadTemplates = async () => {
			try {
				const { data } = await api.get<ProtocolTemplate[]>(
					"/protocol-templates",
				);
				setTemplates(data);
			} catch (error) {
				console.error("Failed to load protocol templates", error);
			} finally {
				setLoading(false);
			}
		};

		loadTemplates();
	}, []);

	const handleDelete = async (template: ProtocolTemplate) => {
		if (!window.confirm(`Ștergi protocolul ${template.name}?`)) return;

		setActionError("");
		try {
			await api.delete(`/protocol-templates/${template.id}`);
			setTemplates((prev) => prev.filter((t) => t.id !== template.id));
		} catch (err: unknown) {
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut șterge protocolul.";
			setActionError(Array.isArray(message) ? message.join(", ") : message);
		}
	};

	return (
		<div>
			<PageHeader
				title="Protocoale"
				subtitle="Șabloane de arbitraj folosite la evaluarea competițiilor."
				actions={
					<button
						onClick={() => setAdding(true)}
						className="bg-[#2a6aa6] hover:bg-[#205280] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						+ Adaugă protocol
					</button>
				}
			/>

			{actionError && (
				<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{actionError}
				</div>
			)}

			{loading ? (
				<div className="text-sm text-[#6b7d92]">Se încarcă...</div>
			) : templates.length === 0 ? (
				<div className="rounded-[10px] border border-[#e2e8f0] bg-white p-6 text-sm text-[#6b7d92]">
					Niciun protocol găsit.
				</div>
			) : (
				<div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-[#f1f7fc]">
							<tr>
								{[
									"Protocol",
									"Nivel",
									"Algoritm",
									"Elemente",
									"Status",
									"",
								].map((h) => (
									<th
										key={h}
										className="text-left px-5 py-3 text-xs font-semibold text-[#6b7d92] uppercase tracking-wide"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{templates.map((t, i) => (
								<tr
									key={t.id}
									className={`border-t border-[#eef2f7] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"} hover:bg-[#f1f7fc] transition`}
								>
									<td className="px-5 py-3">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-[8px] bg-[#f1f7fc] text-[#205280] grid place-items-center flex-shrink-0">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
												>
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
													<polyline points="14 2 14 8 20 8" />
													<line
														x1="16"
														y1="13"
														x2="8"
														y2="13"
													/>
													<line
														x1="16"
														y1="17"
														x2="8"
														y2="17"
													/>
												</svg>
											</div>
											<div>
												<div className="font-semibold text-[#0e1f33]">
													{t.name}
												</div>
												{t.compositionYear && (
													<div className="text-[11px] text-[#6b7d92]">
														din {t.compositionYear}
														{t.revisionYear &&
															t.revisionYear !==
																t.compositionYear &&
															` · revizuit ${t.revisionYear}`}
													</div>
												)}
											</div>
										</div>
									</td>
									<td className="px-5 py-3 text-[#6b7d92] text-xs">
										{t.level ?? "—"}
									</td>
									<td className="px-5 py-3 text-[#34495e] text-xs">
										{algorithmLabels[t.scoringAlgorithm] ??
											t.scoringAlgorithm}
									</td>
									<td className="px-5 py-3 text-[#34495e] font-semibold">
										{t.elementCount}
									</td>
									<td className="px-5 py-3">
										{t.active ? (
											<Badge variant="success">
												Activ
											</Badge>
										) : (
											<Badge variant="gray">
												Inactiv
											</Badge>
										)}
									</td>
									<td className="px-5 py-3">
										<div className="flex items-center gap-1 justify-end">
											<button
												onClick={() =>
													setEditingTemplate(t)
												}
												className="w-8 h-8 rounded-[6px] hover:bg-[#f1f7fc] text-[#6b7d92] hover:text-[#205280] grid place-items-center transition"
												title="Editează"
											>
												✏️
											</button>
											<button
												onClick={() =>
													handleDelete(t)
												}
												className="w-8 h-8 rounded-[6px] hover:bg-red-50 text-[#6b7d92] hover:text-red-500 grid place-items-center transition"
												title="Șterge"
											>
												🗑️
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{(adding || editingTemplate) && (
				<ProtocolFormModal
					template={editingTemplate}
					onClose={() => {
						setAdding(false);
						setEditingTemplate(null);
					}}
					onSaved={(saved) =>
						setTemplates((prev) =>
							editingTemplate
								? prev.map((t) =>
										t.id === saved.id ? saved : t,
									)
								: [saved, ...prev],
						)
					}
				/>
			)}
		</div>
	);
}
