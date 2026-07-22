"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ProtocolTemplateDetail } from "@/types";
import AutoGrowTextarea from "@/components/ui/AutoGrowTextarea";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import LoadingState from "@/components/ui/LoadingState";

interface RowState {
	id?: string;
	letters: string;
	name: string;
	judgingCriteria: string;
	maxScore: string;
	coefficient: string;
}

const EMPTY_ROW: RowState = {
	letters: "",
	name: "",
	judgingCriteria: "",
	maxScore: "10",
	coefficient: "1",
};

const MIN_ROWS = 10;

export default function ProtocolEditPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const canManage = useCanManage();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [locked, setLocked] = useState(false);

	const [name, setName] = useState("");
	const [level, setLevel] = useState("");
	const [compositionYear, setCompositionYear] = useState("");
	const [revisionYear, setRevisionYear] = useState("");
	const [estimatedMinutes, setEstimatedMinutes] = useState("");
	const [rows, setRows] = useState<RowState[]>([]);

	const [editingField, setEditingField] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get<ProtocolTemplateDetail>(
					`/protocol-templates/${params.id}`,
				);
				if (!canManage || data.active) {
					setLocked(true);
					return;
				}
				setName(data.name);
				setLevel(data.level ?? "");
				setCompositionYear(data.compositionYear?.toString() ?? "");
				setRevisionYear(data.revisionYear?.toString() ?? "");
				setEstimatedMinutes(
					data.estimatedTimeSeconds
						? Math.round(
								data.estimatedTimeSeconds / 60,
							).toString()
						: "",
				);

				const existingRows: RowState[] = data.elements.map((el) => ({
					id: el.id,
					letters: el.letters ?? "",
					name: el.name,
					judgingCriteria: el.judgingCriteria ?? "",
					maxScore: el.maxScore,
					coefficient: Number(el.coefficient) === 2 ? "2" : "1",
				}));

				if (existingRows.length === 0) {
					setRows(
						Array.from({ length: MIN_ROWS }, () => ({
							...EMPTY_ROW,
						})),
					);
				} else {
					setRows(existingRows);
				}
			} catch (err) {
				console.error("Failed to load protocol template", err);
				setError("Nu s-a putut încărca protocolul.");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [params.id, canManage]);

	const updateRow = (index: number, field: keyof RowState, value: string) => {
		setRows((prev) =>
			prev.map((row, i) =>
				i === index ? { ...row, [field]: value } : row,
			),
		);
	};

	const addRow = () => {
		setRows((prev) => [...prev, { ...EMPTY_ROW }]);
	};

	const removeRow = (index: number) => {
		setRows((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		setError("");
		setSaving(true);
		try {
			await api.patch(`/protocol-templates/${params.id}/full`, {
				name,
				level: level || undefined,
				compositionYear: compositionYear
					? Number(compositionYear)
					: undefined,
				revisionYear: revisionYear ? Number(revisionYear) : undefined,
				estimatedTimeSeconds: estimatedMinutes
					? Number(estimatedMinutes) * 60
					: undefined,
				elements: rows.map((row) => ({
					id: row.id,
					letters: row.letters || undefined,
					name: row.name,
					judgingCriteria: row.judgingCriteria || undefined,
					maxScore: row.maxScore ? Number(row.maxScore) : undefined,
					coefficient: row.coefficient
						? Number(row.coefficient)
						: undefined,
				})),
			});
			router.push(`/protocoale/${params.id}`);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva protocolul."));
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <LoadingState />;
	}

	if (locked) {
		return (
			<div className="flex flex-col gap-4">
				<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					{!canManage
						? "Nu ai dreptul de a edita protocoale. Doar administratorii pot face asta."
						: "Acest protocol este activ (folosit deja de o competiție) și nu mai poate fi editat."}
				</div>
				<button
					onClick={() => router.push(`/protocoale/${params.id}`)}
					className="text-sm text-[#2a6aa6] hover:underline self-start"
				>
					← Înapoi la vizualizare
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push(`/protocoale/${params.id}`)}
				className="text-sm text-[#2a6aa6] hover:underline self-start"
			>
				← Înapoi la vizualizare
			</button>

			<div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
				{/* Header — styled like the official protocol sheet */}
				<div className="p-6 border-b-2 border-[#0e1f33]">
					{editingField === "name" ? (
						<input
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							onBlur={() => setEditingField(null)}
							className="text-xl font-bold text-[#0e1f33] border border-[#2a6aa6] rounded px-2 py-1 outline-none w-full"
						/>
					) : (
						<h1
							onClick={() => setEditingField("name")}
							className="text-xl font-bold text-[#0e1f33] cursor-text hover:bg-[#f1f7fc] rounded px-1 -mx-1"
							title="Click pentru a modifica"
						>
							{name || "(fără nume)"}
						</h1>
					)}

					<div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-[#34495e]">
						<span className="flex items-center gap-1">
							Nivel:
							{editingField === "level" ? (
								<input
									autoFocus
									value={level}
									onChange={(e) => setLevel(e.target.value)}
									onBlur={() => setEditingField(null)}
									className="border border-[#2a6aa6] rounded px-1.5 py-0.5 outline-none text-sm"
								/>
							) : (
								<span
									onClick={() => setEditingField("level")}
									className="cursor-text hover:bg-[#f1f7fc] rounded px-1"
								>
									{level || "—"}
								</span>
							)}
						</span>

						<span className="flex items-center gap-1">
							An compoziție:
							{editingField === "compositionYear" ? (
								<input
									autoFocus
									type="number"
									value={compositionYear}
									onChange={(e) =>
										setCompositionYear(e.target.value)
									}
									onBlur={() => setEditingField(null)}
									className="border border-[#2a6aa6] rounded px-1.5 py-0.5 outline-none text-sm w-20"
								/>
							) : (
								<span
									onClick={() =>
										setEditingField("compositionYear")
									}
									className="cursor-text hover:bg-[#f1f7fc] rounded px-1"
								>
									{compositionYear || "—"}
								</span>
							)}
						</span>

						<span className="flex items-center gap-1">
							Revizuire:
							{editingField === "revisionYear" ? (
								<input
									autoFocus
									type="number"
									value={revisionYear}
									onChange={(e) =>
										setRevisionYear(e.target.value)
									}
									onBlur={() => setEditingField(null)}
									className="border border-[#2a6aa6] rounded px-1.5 py-0.5 outline-none text-sm w-20"
								/>
							) : (
								<span
									onClick={() =>
										setEditingField("revisionYear")
									}
									className="cursor-text hover:bg-[#f1f7fc] rounded px-1"
								>
									{revisionYear || "—"}
								</span>
							)}
						</span>

						<span className="flex items-center gap-1">
							Timp estimat (min):
							{editingField === "estimatedMinutes" ? (
								<input
									autoFocus
									type="number"
									value={estimatedMinutes}
									onChange={(e) =>
										setEstimatedMinutes(e.target.value)
									}
									onBlur={() => setEditingField(null)}
									className="border border-[#2a6aa6] rounded px-1.5 py-0.5 outline-none text-sm w-20"
								/>
							) : (
								<span
									onClick={() =>
										setEditingField("estimatedMinutes")
									}
									className="cursor-text hover:bg-[#f1f7fc] rounded px-1"
								>
									{estimatedMinutes || "—"}
								</span>
							)}
						</span>
					</div>
				</div>

				{/* Elements table */}
				<div className="overflow-x-auto">
					<table className="w-full text-sm border-collapse">
						<thead className="bg-[#f4f6fb]">
							<tr>
								{[
									"№",
									"Litere",
									"Element / mișcare",
									"Scor max",
									"Coef.",
									"Criteriu de apreciere",
									"",
								].map((h) => (
									<th
										key={h}
										className="text-left px-3 py-2 text-xs font-semibold text-[#6b7d92] uppercase tracking-wide border border-[#e2e8f0]"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row, i) => (
								<tr key={i}>
									<td className="border border-[#e2e8f0] px-3 py-2 text-center font-semibold text-[#0e1f33] w-10 align-top">
										{i + 1}
									</td>
									<td className="border border-[#e2e8f0] p-0 w-20 align-top">
										<AutoGrowTextarea
											value={row.letters}
											onChange={(value) =>
												updateRow(i, "letters", value)
											}
											className="w-full px-2 py-2 text-sm outline-none focus:bg-[#f1f7fc]"
										/>
									</td>
									<td className="border border-[#e2e8f0] p-0 align-top">
										<AutoGrowTextarea
											value={row.name}
											onChange={(value) =>
												updateRow(i, "name", value)
											}
											placeholder="Denumire element"
											className="w-full px-2 py-2 text-sm outline-none focus:bg-[#f1f7fc]"
										/>
									</td>
									<td className="border border-[#e2e8f0] p-0 w-20 align-top">
										<input
											type="number"
											value={row.maxScore}
											onChange={(e) =>
												updateRow(
													i,
													"maxScore",
													e.target.value,
												)
											}
											className="w-full px-2 py-2 text-sm outline-none focus:bg-[#f1f7fc]"
										/>
									</td>
									<td className="border border-[#e2e8f0] p-0 w-20 align-top">
										<select
											value={row.coefficient}
											onChange={(e) =>
												updateRow(
													i,
													"coefficient",
													e.target.value,
												)
											}
											className="w-full px-2 py-2 text-sm outline-none focus:bg-[#f1f7fc] bg-transparent"
										>
											<option value="1">1</option>
											<option value="2">2</option>
										</select>
									</td>
									<td className="border border-[#e2e8f0] p-0 align-top">
										<AutoGrowTextarea
											value={row.judgingCriteria}
											onChange={(value) =>
												updateRow(
													i,
													"judgingCriteria",
													value,
												)
											}
											className="w-full px-2 py-2 text-sm outline-none focus:bg-[#f1f7fc]"
										/>
									</td>
									<td className="border border-[#e2e8f0] text-center w-10 align-top">
										<button
											onClick={() => removeRow(i)}
											title="Șterge rândul"
											className="text-[#b0bcd4] hover:text-red-500 transition"
										>
											✕
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="p-4">
					<button
						onClick={addRow}
						className="text-sm text-[#2a6aa6] border border-[#b5d7f1] px-3 py-1.5 rounded-[8px] hover:bg-[#f1f7fc] transition"
					>
						+ Adaugă rând
					</button>
				</div>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{error}
				</div>
			)}

			<div className="flex justify-end">
				<button
					onClick={handleSave}
					disabled={saving}
					className="bg-[#2a6aa6] hover:bg-[#205280] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-[10px] transition"
				>
					{saving ? "Se salvează..." : "Salvează protocolul"}
				</button>
			</div>
		</div>
	);
}
