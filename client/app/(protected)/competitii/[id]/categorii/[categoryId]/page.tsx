"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import {
	Athlete,
	CategoryDetail,
	EvaluationDetail,
	ProtocolTemplate,
} from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";

interface ScoreRowState {
	value: string;
	correction: string;
	remark: string;
}

export default function CategoryScoringPage() {
	const params = useParams<{ id: string; categoryId: string }>();
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const canManage = useCanManage();

	const [category, setCategory] = useState<CategoryDetail | null>(null);
	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Draft stage: edit category
	const [editingCategory, setEditingCategory] = useState(false);
	const [name, setName] = useState("");
	const [templateId, setTemplateId] = useState("");
	const [savingCategory, setSavingCategory] = useState(false);

	// Draft stage: referees
	const [addingReferee, setAddingReferee] = useState(false);
	const [refFirstName, setRefFirstName] = useState("");
	const [refLastName, setRefLastName] = useState("");
	const [refLetterCode, setRefLetterCode] = useState("");

	// Published stage: participants
	const [addingParticipation, setAddingParticipation] = useState(false);
	const [selectedAthleteId, setSelectedAthleteId] = useState("");
	const [horseName, setHorseName] = useState("");

	// Ongoing stage: scoring
	const [participationId, setParticipationId] = useState("");
	const [refereeId, setRefereeId] = useState("");
	const [rows, setRows] = useState<Record<string, ScoreRowState>>({});
	const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(
		null,
	);
	const [loadingEvaluation, setLoadingEvaluation] = useState(false);
	const [saving, setSaving] = useState(false);

	const loadCategory = async () => {
		try {
			const { data } = await api.get<CategoryDetail>(
				`/categories/${params.categoryId}`,
			);
			setCategory(data);
			setName(data.name);
			setTemplateId(data.protocolTemplateId);
		} catch (err) {
			console.error("Failed to load category", err);
			setError("Nu s-a putut încărca categoria.");
		}
	};

	useEffect(() => {
		const load = async () => {
			try {
				const [, athletesRes, templatesRes] = await Promise.all([
					loadCategory(),
					api.get<Athlete[]>("/athletes"),
					api.get<ProtocolTemplate[]>("/protocol-templates"),
				]);
				setAthletes(athletesRes.data);
				setTemplates(templatesRes.data);
			} finally {
				setLoading(false);
			}
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.categoryId]);

	const emptyRows = (): Record<string, ScoreRowState> => {
		const map: Record<string, ScoreRowState> = {};
		category?.elements.forEach((el) => {
			map[el.id] = { value: "", correction: "", remark: "" };
		});
		return map;
	};

	useEffect(() => {
		const loadEvaluation = async () => {
			if (!participationId || !refereeId) {
				setEvaluation(null);
				setRows(emptyRows());
				return;
			}
			setLoadingEvaluation(true);
			try {
				const { data } = await api.get<EvaluationDetail | null>(
					"/evaluations",
					{ params: { participationId, categoryRefereeId: refereeId } },
				);
				setEvaluation(data);
				const map = emptyRows();
				if (data) {
					for (const s of data.scores) {
						map[s.elementId] = {
							value: s.value ?? "",
							correction: s.correction ?? "",
							remark: s.remark ?? "",
						};
					}
				}
				setRows(map);
			} catch (err) {
				console.error("Failed to load evaluation", err);
			} finally {
				setLoadingEvaluation(false);
			}
		};

		loadEvaluation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [participationId, refereeId, category]);

	const updateRow = (
		elementId: string,
		field: keyof ScoreRowState,
		value: string,
	) => {
		setRows((prev) => ({
			...prev,
			[elementId]: { ...prev[elementId], [field]: value },
		}));
	};

	const handleSaveCategory = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();
		setError("");
		setSavingCategory(true);
		try {
			await api.patch(`/categories/${params.categoryId}`, {
				name,
				protocolTemplateId: templateId,
			});
			setEditingCategory(false);
			await loadCategory();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva categoria."));
		} finally {
			setSavingCategory(false);
		}
	};

	const handleAddReferee = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		try {
			await api.post(`/categories/${params.categoryId}/referees`, {
				firstName: refFirstName,
				lastName: refLastName,
				letterCode: refLetterCode,
			});
			setRefFirstName("");
			setRefLastName("");
			setRefLetterCode("");
			setAddingReferee(false);
			await loadCategory();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut adăuga arbitrul."));
		}
	};

	const handleRemoveReferee = async (refereeId: string) => {
		setError("");
		try {
			await api.delete(
				`/categories/${params.categoryId}/referees/${refereeId}`,
			);
			await loadCategory();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut elimina arbitrul."));
		}
	};

	const handleAddParticipation = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();
		setError("");
		try {
			await api.post(
				`/categories/${params.categoryId}/participations`,
				{ athleteId: selectedAthleteId, horseName: horseName || undefined },
			);
			setSelectedAthleteId("");
			setHorseName("");
			setAddingParticipation(false);
			await loadCategory();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut înscrie sportivul."));
		}
	};

	const handleSave = async (finalized: boolean) => {
		if (!category || !participationId || !refereeId) return;
		setError("");
		setSaving(true);
		try {
			const { data } = await api.put<EvaluationDetail>("/evaluations", {
				participationId,
				categoryRefereeId: refereeId,
				finalized,
				scores: category.elements.map((el) => ({
					elementId: el.id,
					value: rows[el.id]?.value
						? Number(rows[el.id].value)
						: undefined,
					correction: rows[el.id]?.correction
						? Number(rows[el.id].correction)
						: undefined,
					remark: rows[el.id]?.remark || undefined,
				})),
			});
			setEvaluation(data);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut salva evaluarea."));
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <LoadingState />;
	}
	if (!category) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				Categoria nu a fost găsită.
			</div>
		);
	}

	const stage = category.eventStatus;
	const canScore = user?.role === "ADMIN" || user?.role === "MODERATOR";

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push(`/competitii/${params.id}`)}
				className="text-sm text-[var(--color-blue-600)] hover:underline self-start"
			>
				← Înapoi la eveniment
			</button>

			<div>
				<h1 className="text-2xl font-bold text-[var(--color-blue-900)]">
					{category.name}
				</h1>
				<p className="text-sm text-[var(--color-slate-500)] mt-1">
					Protocol: {category.protocolTemplateName}
				</p>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{error}
				</div>
			)}

			{stage === "DRAFT" && canManage && (
				<>
					{/* Category data */}
					<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
								Date categorie
							</h3>
							{!editingCategory && (
								<button
									onClick={() => setEditingCategory(true)}
									className="text-xs text-[var(--color-blue-600)] hover:underline"
								>
									Editează
								</button>
							)}
						</div>
						{editingCategory ? (
							<form
								onSubmit={handleSaveCategory}
								className="flex flex-wrap gap-2 items-end"
							>
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-[var(--color-slate-500)]">
										Nume categorie
									</label>
									<input
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										required
										className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-[var(--color-slate-500)]">
										Protocol
									</label>
									<select
										value={templateId}
										onChange={(e) =>
											setTemplateId(e.target.value)
										}
										required
										className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
									>
										{templates.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name}
												{t.level ? ` — ${t.level}` : ""}
											</option>
										))}
									</select>
								</div>
								<button
									type="button"
									onClick={() => {
										setEditingCategory(false);
										setName(category.name);
										setTemplateId(
											category.protocolTemplateId,
										);
									}}
									className="px-3 py-1.5 text-xs text-[var(--color-slate-500)] hover:text-[var(--color-blue-900)] transition"
								>
									Anulează
								</button>
								<button
									type="submit"
									disabled={savingCategory}
									className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
								>
									{savingCategory
										? "Se salvează..."
										: "Salvează"}
								</button>
							</form>
						) : (
							<p className="text-sm text-[var(--color-blue-900)]">
								{category.name} —{" "}
								{category.protocolTemplateName}
							</p>
						)}
					</div>

					{/* Referees */}
					<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
								Arbitri
							</h3>
							<button
								onClick={() => setAddingReferee((v) => !v)}
								className="text-xs text-[var(--color-blue-600)] hover:underline"
							>
								+ Adaugă arbitru
							</button>
						</div>
						{addingReferee && (
							<form
								onSubmit={handleAddReferee}
								className="flex flex-wrap gap-2 items-end mb-3"
							>
								<input
									value={refFirstName}
									onChange={(e) =>
										setRefFirstName(e.target.value)
									}
									placeholder="Prenume"
									required
									className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
								<input
									value={refLastName}
									onChange={(e) =>
										setRefLastName(e.target.value)
									}
									placeholder="Nume"
									required
									className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
								/>
								<input
									value={refLetterCode}
									onChange={(e) =>
										setRefLetterCode(
											e.target.value.toUpperCase(),
										)
									}
									placeholder="Literă (C, H...)"
									required
									maxLength={2}
									className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)] w-32"
								/>
								<button
									type="submit"
									className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
								>
									Salvează
								</button>
							</form>
						)}
						{category.referees.length === 0 ? (
							<p className="text-xs text-[var(--color-slate-500)]">
								Niciun arbitru adăugat încă.
							</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{category.referees.map((r) => (
									<span
										key={r.id}
										className="flex items-center gap-1.5 text-xs bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
									>
										{r.letterCode} — {r.firstName}{" "}
										{r.lastName}
										<button
											onClick={() =>
												handleRemoveReferee(r.id)
											}
											className="text-[var(--color-blue-800)] hover:text-red-600"
											title="Elimină arbitrul"
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
					</div>
				</>
			)}

			{stage === "PUBLISHED" && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
							Participanți
						</h3>
						{canManage && (
							<button
								onClick={() =>
									setAddingParticipation((v) => !v)
								}
								className="text-xs text-[var(--color-blue-600)] hover:underline"
							>
								+ Înscrie sportiv
							</button>
						)}
					</div>
					{addingParticipation && canManage && (
						<form
							onSubmit={handleAddParticipation}
							className="flex flex-wrap gap-2 items-end mb-3"
						>
							<select
								value={selectedAthleteId}
								onChange={(e) =>
									setSelectedAthleteId(e.target.value)
								}
								required
								className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
							>
								<option value="">Alege sportiv</option>
								{athletes.map((a) => (
									<option key={a.id} value={a.id}>
										{formatFullName(a.firstName, a.lastName, a.email)}
									</option>
								))}
							</select>
							<input
								value={horseName}
								onChange={(e) => setHorseName(e.target.value)}
								placeholder="Nume cal (opțional)"
								className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
							/>
							<button
								type="submit"
								className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
							>
								Salvează
							</button>
						</form>
					)}
					{category.participations.length === 0 ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Niciun sportiv înscris încă.
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{category.participations.map((p) => (
								<span
									key={p.id}
									className="text-xs bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
								>
									{p.athleteName}
									{p.horseName ? ` · ${p.horseName}` : ""}
								</span>
							))}
						</div>
					)}
				</div>
			)}

			{stage === "ONGOING" && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4 flex flex-col gap-4">
					<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
						Notare
					</h3>

					<div className="flex flex-wrap gap-3">
						<select
							value={participationId}
							onChange={(e) =>
								setParticipationId(e.target.value)
							}
							className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
						>
							<option value="">Alege participant</option>
							{category.participations.map((p) => (
								<option key={p.id} value={p.id}>
									{p.athleteName}
									{p.horseName ? ` · ${p.horseName}` : ""}
								</option>
							))}
						</select>
						<select
							value={refereeId}
							onChange={(e) => setRefereeId(e.target.value)}
							className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
						>
							<option value="">Alege arbitru</option>
							{category.referees.map((r) => (
								<option key={r.id} value={r.id}>
									{r.letterCode} — {r.firstName} {r.lastName}
								</option>
							))}
						</select>
					</div>

					{!participationId || !refereeId ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Alege un participant și un arbitru pentru a începe
							notarea.
						</p>
					) : loadingEvaluation ? (
						<div className="text-sm text-[var(--color-slate-500)]">
							Se încarcă evaluarea...
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-sm border-collapse">
									<thead className="bg-[var(--color-silver-bg)]">
										<tr>
											{[
												"№",
												"Element",
												"Scor max",
												"Notă",
												"Corecție",
												"Coef.",
												"Observații",
											].map((h) => (
												<th
													key={h}
													className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
												>
													{h}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{category.elements.map((el) => (
											<tr key={el.id}>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
													{el.order}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5">
													{el.letters
														? `${el.letters} — `
														: ""}
													{el.name}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{el.maxScore}
												</td>
												<td className="border border-[var(--color-border)] p-0 w-20">
													<input
														type="number"
														step="0.5"
														disabled={!canScore}
														value={
															rows[el.id]?.value ??
															""
														}
														onChange={(e) =>
															updateRow(
																el.id,
																"value",
																e.target.value,
															)
														}
														className="w-full px-2 py-1.5 text-sm outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
													/>
												</td>
												<td className="border border-[var(--color-border)] p-0 w-20">
													<input
														type="number"
														step="0.5"
														disabled={!canScore}
														value={
															rows[el.id]
																?.correction ?? ""
														}
														onChange={(e) =>
															updateRow(
																el.id,
																"correction",
																e.target.value,
															)
														}
														className="w-full px-2 py-1.5 text-sm outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
													/>
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{Number(el.coefficient) === 2
														? "2"
														: ""}
												</td>
												<td className="border border-[var(--color-border)] p-0">
													<input
														disabled={!canScore}
														value={
															rows[el.id]?.remark ??
															""
														}
														onChange={(e) =>
															updateRow(
																el.id,
																"remark",
																e.target.value,
															)
														}
														className="w-full px-2 py-1.5 text-sm outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{evaluation && (
								<div className="text-sm text-[var(--color-blue-900)]">
									Scor total:{" "}
									<b>{evaluation.finalScore ?? "—"}</b>
									{evaluation.percentage && (
										<span className="text-[var(--color-slate-500)]">
											{" "}
											({Number(evaluation.percentage).toFixed(2)}
											%)
										</span>
									)}
								</div>
							)}

							{canScore && (
								<div className="flex justify-end gap-2">
									<button
										onClick={() => handleSave(false)}
										disabled={saving}
										className="border border-[var(--color-blue-300)] text-[var(--color-blue-600)] disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[var(--color-blue-50)] transition"
									>
										{saving ? "Se salvează..." : "Salvează"}
									</button>
									<button
										onClick={() => handleSave(true)}
										disabled={saving}
										className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
									>
										Finalizează
									</button>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{stage === "COMPLETED" && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<h3 className="font-semibold text-[var(--color-blue-900)] text-sm mb-3">
						Rezultate
					</h3>
					{category.participations.length === 0 ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Niciun rezultat disponibil.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm border-collapse">
								<thead className="bg-[var(--color-silver-bg)]">
									<tr>
										{[
											"Loc",
											"Sportiv",
											"Cal",
											"Scor final",
											"Stare",
										].map((h) => (
											<th
												key={h}
												className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
											>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{[...category.participations]
										.sort((a, b) => {
											if (a.rank == null) return 1;
											if (b.rank == null) return -1;
											return a.rank - b.rank;
										})
										.map((p) => (
											<tr key={p.id}>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
													{p.rank ?? "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5">
													{p.athleteName}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5">
													{p.horseName ?? "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{p.finalScore ?? "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{p.status}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
