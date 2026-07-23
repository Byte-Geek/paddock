"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { CategoryDetail, EvaluationDetail } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { formatPercentage } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";

export default function ParticipationScoringPage() {
	const params = useParams<{
		id: string;
		categoryId: string;
		participationId: string;
	}>();
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const canScore = user?.role === "ADMIN" || user?.role === "MODERATOR";

	const [category, setCategory] = useState<CategoryDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// values[elementId][refereeId] = notă
	const [values, setValues] = useState<
		Record<string, Record<string, string>>
	>({});
	const [finalizedByReferee, setFinalizedByReferee] = useState<
		Record<string, boolean>
	>({});
	const [saving, setSaving] = useState(false);
	const [errorCount, setErrorCount] = useState("");

	const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	const load = async () => {
		setError("");
		try {
			const [categoryRes, evaluationsRes] = await Promise.all([
				api.get<CategoryDetail>(
					`/categories/${params.categoryId}`,
				),
				api.get<EvaluationDetail[]>(
					`/evaluations/by-participation/${params.participationId}`,
				),
			]);
			setCategory(categoryRes.data);

			const nextValues: Record<string, Record<string, string>> = {};
			const nextFinalized: Record<string, boolean> = {};

			for (const evaluation of evaluationsRes.data) {
				nextFinalized[evaluation.categoryRefereeId] =
					evaluation.finalized;
				for (const s of evaluation.scores) {
					if (!nextValues[s.elementId]) {
						nextValues[s.elementId] = {};
					}
					nextValues[s.elementId][evaluation.categoryRefereeId] =
						s.value ?? "";
				}
			}

			setValues(nextValues);
			setFinalizedByReferee(nextFinalized);
		} catch (err) {
			console.error("Failed to load scoring data", err);
			setError("Nu s-au putut încărca datele.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.categoryId, params.participationId]);

	const updateValue = (
		elementId: string,
		refereeId: string,
		value: string,
	) => {
		let clamped = value;

		// Allow at most 2 decimal digits.
		const decimalMatch = clamped.match(/^(-?\d*)\.(\d*)$/);
		if (decimalMatch && decimalMatch[2].length > 2) {
			clamped = `${decimalMatch[1]}.${decimalMatch[2].slice(0, 2)}`;
		}

		const maxScore = category?.elements.find(
			(el) => el.id === elementId,
		)?.maxScore;
		if (maxScore !== undefined && clamped !== "") {
			const num = Number(clamped);
			if (!Number.isNaN(num) && num > Number(maxScore)) {
				clamped = maxScore;
			}
		}
		setValues((prev) => ({
			...prev,
			[elementId]: { ...prev[elementId], [refereeId]: clamped },
		}));
	};

	const computeLiveTotal = (refereeId: string) => {
		if (!category) return { finalScore: 0, percentage: 0 };
		let finalScore = 0;
		let maxPossible = 0;
		for (const el of category.elements) {
			const coefficient = Number(el.coefficient);
			maxPossible += Number(el.maxScore) * coefficient;
			const raw = values[el.id]?.[refereeId];
			finalScore += (raw ? Number(raw) : 0) * coefficient;
		}

		let percentage = maxPossible > 0 ? (finalScore / maxPossible) * 100 : 0;

		const errors = Number(errorCount) || 0;
		if (errors > 0) {
			percentage -= errors * 0.5;
		}

		return { finalScore, percentage };
	};

	const computeOverallTotal = () => {
		if (!category) return { finalScore: 0, percentage: 0 };
		let maxPerReferee = 0;
		for (const el of category.elements) {
			maxPerReferee += Number(el.maxScore) * Number(el.coefficient);
		}
		const totalMax = maxPerReferee * category.referees.length;
		const finalScore = category.referees.reduce(
			(sum, r) => sum + computeLiveTotal(r.id).finalScore,
			0,
		);
		let percentage = totalMax > 0 ? (finalScore / totalMax) * 100 : 0;

		const errors = Number(errorCount) || 0;
		if (errors > 0) {
			percentage -= errors * 0.5;
		}

		return { finalScore, percentage };
	};

	const focusCell = (elementIndex: number, refereeIndex: number) => {
		if (!category) return;
		const key = `${category.elements[elementIndex].id}-${category.referees[refereeIndex].id}`;
		inputRefs.current[key]?.focus();
	};

	const handleCellKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		elementIndex: number,
		refereeIndex: number,
	) => {
		if (!category) return;

		if (e.key === "Enter") {
			e.preventDefault();
			let nextElementIndex = elementIndex + 1;
			let nextRefereeIndex = refereeIndex;
			if (nextElementIndex >= category.elements.length) {
				nextElementIndex = 0;
				nextRefereeIndex = refereeIndex + 1;
				if (nextRefereeIndex >= category.referees.length) {
					return;
				}
			}
			focusCell(nextElementIndex, nextRefereeIndex);
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (elementIndex + 1 < category.elements.length) {
				focusCell(elementIndex + 1, refereeIndex);
			}
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (elementIndex > 0) {
				focusCell(elementIndex - 1, refereeIndex);
			}
			return;
		}

		if (e.key === "ArrowRight") {
			e.preventDefault();
			if (refereeIndex + 1 < category.referees.length) {
				focusCell(elementIndex, refereeIndex + 1);
			}
			return;
		}

		if (e.key === "ArrowLeft") {
			e.preventDefault();
			if (refereeIndex > 0) {
				focusCell(elementIndex, refereeIndex - 1);
			}
			return;
		}
	};

	const handleSave = async () => {
		if (!category) return;
		setError("");
		setSaving(true);
		try {
			for (const referee of category.referees) {
				const scores = category.elements.map((el) => ({
					elementId: el.id,
					value: values[el.id]?.[referee.id]
						? Number(values[el.id][referee.id])
						: undefined,
				}));
				const hasAnyValue = scores.some((s) => s.value !== undefined);
				if (!hasAnyValue) continue;

				await api.put<EvaluationDetail>("/evaluations", {
					participationId: params.participationId,
					categoryRefereeId: referee.id,
					finalized: true,
					scores,
				});
			}
			router.push(
				`/competitii/${params.id}/categorii/${params.categoryId}`,
			);
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

	const participation = category.participations.find(
		(p) => p.id === params.participationId,
	);
	if (!participation) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				Participantul nu a fost găsit.
			</div>
		);
	}

	const canEdit = canScore && category.eventStatus === "ONGOING";

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() =>
					router.push(
						`/competitii/${params.id}/categorii/${params.categoryId}`,
					)
				}
				className="text-sm text-[var(--color-blue-600)] hover:underline self-start"
			>
				← Înapoi la categorie
			</button>

			<div>
				<h1 className="text-2xl font-bold text-[var(--color-blue-900)]">
					{participation.athleteName}
				</h1>
				<p className="text-sm text-[var(--color-slate-500)] mt-1">
					{category.name}
					{participation.horseName
						? ` · ${participation.horseName}`
						: ""}
				</p>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{error}
				</div>
			)}

			<div className="bg-surface rounded-md border border-[var(--color-border)] p-4 flex flex-col gap-4">
				<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
					Notare
				</h3>

				{category.referees.length === 0 ? (
					<p className="text-xs text-[var(--color-slate-500)]">
						Categoria nu are niciun arbitru asociat.
					</p>
				) : (
					<>
						<div className="flex items-center gap-2">
							<label className="text-xs font-medium text-[var(--color-slate-500)]">
								Număr greșeli
							</label>
							<input
								type="number"
								min={0}
								step={1}
								value={errorCount}
								onChange={(e) =>
									setErrorCount(e.target.value)
								}
								onKeyDown={(e) => {
									if (
										e.key === "Enter" &&
										category.elements.length > 0 &&
										category.referees.length > 0
									) {
										e.preventDefault();
										const firstKey = `${category.elements[0].id}-${category.referees[0].id}`;
										inputRefs.current[firstKey]?.focus();
									}
								}}
								disabled={!canEdit}
								className="w-20 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm text-center outline-none focus:border-[var(--color-blue-600)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
							/>
							<span className="text-xs text-[var(--color-slate-500)]">
								−0,5% din procentaj per greșeală, la fiecare
								arbitru
							</span>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full text-sm border-collapse">
								<thead className="bg-[var(--color-silver-bg)]">
									<tr>
										{["№", "Element", "Scor max"].map(
											(h) => (
												<th
													key={h}
													className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
												>
													{h}
												</th>
											),
										)}
										{category.referees.map((r) => (
											<th
												key={r.id}
												className="text-center px-2 py-1.5 text-xs font-semibold text-[var(--color-blue-800)] border border-[var(--color-border)] whitespace-nowrap"
											>
												{r.letterCode} — {r.firstName}{" "}
												{r.lastName}
												{finalizedByReferee[r.id] && (
													<span className="ml-1 text-[var(--color-success)]">
														✓
													</span>
												)}
											</th>
										))}
										<th className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
											Coef.
										</th>
									</tr>
								</thead>
								<tbody>
									{category.elements.map((el, elementIndex) => (
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
											{category.referees.map(
												(r, refereeIndex) => {
													const key = `${el.id}-${r.id}`;
													return (
														<td
															key={r.id}
															className="border border-[var(--color-border)] p-0 w-20"
														>
															<input
																ref={(node) => {
																	inputRefs.current[
																		key
																	] = node;
																}}
																type="number"
																step="0.01"
																min={0}
																max={el.maxScore}
																disabled={
																	!canEdit
																}
																value={
																	values[
																		el.id
																	]?.[r.id] ??
																	""
																}
																onChange={(e) =>
																	updateValue(
																		el.id,
																		r.id,
																		e.target
																			.value,
																	)
																}
																onKeyDown={(e) =>
																	handleCellKeyDown(
																		e,
																		elementIndex,
																		refereeIndex,
																	)
																}
																className="w-full px-2 py-1.5 text-sm text-center outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
															/>
														</td>
													);
												},
											)}
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
												{Number(el.coefficient) === 2
													? "2"
													: ""}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="bg-[var(--color-blue-50)]">
										<td
											colSpan={3}
											className="border border-[var(--color-border)] px-2 py-1.5 text-right font-semibold text-[var(--color-blue-900)]"
										>
											Total
										</td>
										{category.referees.map((r) => {
											const total = computeLiveTotal(
												r.id,
											);
											return (
												<td
													key={r.id}
													className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]"
												>
													{total.finalScore.toFixed(2)}
													<span className="block text-[10px] font-normal text-[var(--color-slate-500)]">
														{formatPercentage(
															total.percentage,
														)}
														%
													</span>
												</td>
											);
										})}
										<td className="border border-[var(--color-border)]" />
									</tr>
									<tr className="bg-[var(--color-blue-100)]">
										<td
											colSpan={3}
											className="border border-[var(--color-border)] px-2 py-1.5 text-right font-bold text-[var(--color-blue-900)]"
										>
											Total general
										</td>
										<td
											colSpan={category.referees.length}
											className="border border-[var(--color-border)] px-2 py-1.5 text-center font-bold text-[var(--color-blue-900)]"
										>
											{computeOverallTotal().finalScore.toFixed(
												2,
											)}
											<span className="ml-2 font-normal text-[var(--color-blue-800)]">
												(
												{formatPercentage(
													computeOverallTotal()
														.percentage,
												)}
												%)
											</span>
										</td>
										<td className="border border-[var(--color-border)]" />
									</tr>
								</tfoot>
							</table>
						</div>

						{category.eventStatus === "COMPLETED" && (
							<p className="text-xs text-[var(--color-slate-500)] italic">
								Competiția este finalizată — notele nu mai pot
								fi modificate. Pentru corecții, trece
								competiția înapoi în starea „În desfășurare".
							</p>
						)}

						{canEdit && (
							<div className="flex justify-end gap-2">
								<button
									onClick={() => handleSave()}
									disabled={saving}
									className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
								>
									{saving ? "Se salvează..." : "Salvează"}
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
