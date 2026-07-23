"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import ProtocolFormModal from "@/components/protocoale/ProtocolFormModal";
import api from "@/lib/axios";
import { ProtocolTemplate } from "@/types";
import { useCanManage } from "@/lib/hooks/useCanManage";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

const algorithmLabels: Record<string, string> = {
	SUM: "Sumă",
	AVERAGE: "Medie",
	AVERAGE_DROP_HIGH_LOW: "Medie fără extreme",
	WEIGHTED_SUM: "Sumă ponderată",
};

export default function ProtocoalePage() {
	const canManage = useCanManage();

	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [adding, setAdding] = useState(false);

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

	return (
		<div>
			<PageHeader
				title="Protocoale"
				subtitle="Șabloane de arbitraj folosite la evaluarea competițiilor."
				actions={
					canManage && (
						<button
							onClick={() => setAdding(true)}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
						>
							+ Adaugă protocol
						</button>
					)
				}
			/>

			{loading ? (
				<LoadingState />
			) : templates.length === 0 ? (
				<EmptyState>Niciun protocol găsit.</EmptyState>
			) : (
				<div className="bg-surface rounded-md border border-[var(--color-border)] overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-[var(--color-blue-50)]">
							<tr>
								{[
									"Protocol",
									"Nivel",
									"Algoritm",
									"Elemente",
									"Utilizări",
									"Status",
									"",
								].map((h) => (
									<th
										key={h}
										className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide"
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
									className={`border-t border-[var(--color-border-soft)] ${i % 2 === 0 ? "bg-surface" : "bg-[var(--color-surface-subtle)]"} hover:bg-[var(--color-blue-50)] transition`}
								>
									<td className="px-5 py-3">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-sm bg-[var(--color-blue-50)] text-[var(--color-blue-800)] grid place-items-center flex-shrink-0">
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
												<div className="font-semibold text-[var(--color-blue-900)]">
													{t.name}
												</div>
												{t.compositionYear && (
													<div className="text-[11px] text-[var(--color-slate-500)]">
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
									<td className="px-5 py-3 text-[var(--color-slate-500)] text-xs">
										{t.level ?? "—"}
									</td>
									<td className="px-5 py-3 text-[var(--color-ink-700)] text-xs">
										{algorithmLabels[t.scoringAlgorithm] ??
											t.scoringAlgorithm}
									</td>
									<td className="px-5 py-3 text-[var(--color-ink-700)] font-semibold">
										{t.elementCount}
									</td>
									<td className="px-5 py-3 text-[var(--color-ink-700)] font-semibold">
										{t.categoryCount}
									</td>
									<td className="px-5 py-3">
										{t.active ? (
											<Badge variant="warning">
												Activ
											</Badge>
										) : (
											<Badge variant="gray">
												Inactiv
											</Badge>
										)}
									</td>
									<td className="px-5 py-3">
										<div className="flex items-center justify-end">
											<Link
												href={`/protocoale/${t.id}`}
												className="w-8 h-8 rounded-[6px] hover:bg-[var(--color-blue-50)] text-[var(--color-slate-500)] hover:text-[var(--color-blue-800)] grid place-items-center transition"
												title="Vizualizează"
											>
												👁
											</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{adding && canManage && (
				<ProtocolFormModal
					onClose={() => setAdding(false)}
					onSaved={(saved) =>
						setTemplates((prev) => [saved, ...prev])
					}
				/>
			)}
		</div>
	);
}
