"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
	Athlete,
	CategoryDetail,
	CategoryParticipation,
	ProtocolTemplate,
} from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import { formatFullName, formatPercentage } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";
import SearchInput from "@/components/ui/SearchInput";

type ParticipationPatch = Partial<{
	horseName: string;
	startOrder: number;
	startTime: string;
}>;

function ParticipationRow({
	participation,
	canManage,
	onSave,
}: {
	participation: CategoryParticipation;
	canManage: boolean;
	onSave: (patch: ParticipationPatch) => void;
}) {
	const [startOrder, setStartOrder] = useState(
		participation.startOrder?.toString() ?? "",
	);
	const [horseName, setHorseName] = useState(participation.horseName ?? "");
	const [startTime, setStartTime] = useState(participation.startTime ?? "");

	useEffect(() => {
		setStartOrder(participation.startOrder?.toString() ?? "");
		setHorseName(participation.horseName ?? "");
		setStartTime(participation.startTime ?? "");
	}, [participation]);

	return (
		<tr>
			<td className="border border-[var(--color-border)] p-0 w-20">
				<input
					type="number"
					disabled={!canManage}
					value={startOrder}
					onChange={(e) => setStartOrder(e.target.value)}
					onBlur={() => {
						const n =
							startOrder === "" ? undefined : Number(startOrder);
						if (n !== undefined && n !== participation.startOrder) {
							onSave({ startOrder: n });
						}
					}}
					className="w-full px-2 py-1.5 text-sm text-center outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
				/>
			</td>
			<td className="border border-[var(--color-border)] px-2 py-1.5">
				{participation.athleteName}
			</td>
			<td className="border border-[var(--color-border)] p-0">
				<input
					disabled={!canManage}
					value={horseName}
					onChange={(e) => setHorseName(e.target.value)}
					onBlur={() => {
						if (horseName !== (participation.horseName ?? "")) {
							onSave({ horseName });
						}
					}}
					className="w-full px-2 py-1.5 text-sm outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
				/>
			</td>
			<td className="border border-[var(--color-border)] p-0 w-28">
				<input
					type="time"
					disabled={!canManage}
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
					onBlur={() => {
						if (startTime !== (participation.startTime ?? "")) {
							onSave({ startTime });
						}
					}}
					className="w-full px-2 py-1.5 text-sm outline-none focus:bg-[var(--color-blue-50)] disabled:bg-[var(--color-surface-subtle)] disabled:text-[var(--color-slate-500)]"
				/>
			</td>
		</tr>
	);
}

function AthleteCombobox({
	athletes,
	selectedAthleteId,
	onSelect,
	onSelected,
}: {
	athletes: Athlete[];
	selectedAthleteId: string;
	onSelect: (id: string) => void;
	onSelected?: () => void;
}) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

	useEffect(() => {
		if (!selectedAthleteId) {
			setQuery("");
		}
	}, [selectedAthleteId]);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const filtered = athletes.filter((a) => {
		const athleteName = formatFullName(
			a.firstName,
			a.lastName,
			a.email,
		).toLowerCase();
		return athleteName.includes(query.toLowerCase());
	});

	const displayValue =
		selectedAthlete && !open
			? formatFullName(
					selectedAthlete.firstName,
					selectedAthlete.lastName,
					selectedAthlete.email,
				)
			: query;

	const selectAt = (index: number) => {
		const athlete = filtered[index];
		if (!athlete) return;
		onSelect(athlete.id);
		setQuery("");
		setOpen(false);
		onSelected?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				setOpen(true);
				setHighlighted(0);
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlighted((h) => Math.max(h - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			selectAt(highlighted);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div ref={containerRef} className="relative">
			<SearchInput
				value={displayValue}
				onChange={(v) => {
					setQuery(v);
					if (selectedAthleteId) onSelect("");
					setHighlighted(0);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={handleKeyDown}
				placeholder="Caută sportiv..."
			/>
			{open && (
				<div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-surface border border-[var(--color-border-soft)] rounded-md shadow-[var(--shadow-panel-hover)]">
					{filtered.length === 0 ? (
						<div className="px-3 py-3 text-sm text-[var(--color-slate-500)] text-center">
							Niciun sportiv găsit.
						</div>
					) : (
						filtered.map((a, i) => {
							const athleteName = formatFullName(
								a.firstName,
								a.lastName,
								a.email,
							);
							const isHighlighted = i === highlighted;
							return (
								<button
									type="button"
									key={a.id}
									onMouseEnter={() => setHighlighted(i)}
									onClick={() => selectAt(i)}
									className={`w-full text-left px-3 py-2 text-sm transition-colors ${
										isHighlighted
											? "bg-[var(--color-blue-50)] text-[var(--color-blue-800)]"
											: "text-[var(--color-ink-800)]"
									}`}
								>
									{athleteName}
								</button>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}

export default function CategoryScoringPage() {
	const params = useParams<{ id: string; categoryId: string }>();
	const router = useRouter();
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
	const horseNameInputRef = useRef<HTMLInputElement>(null);

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
			closeAddParticipationModal();
			await loadCategory();
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut înscrie sportivul."));
		}
	};

	const closeAddParticipationModal = () => {
		setAddingParticipation(false);
		setSelectedAthleteId("");
		setHorseName("");
	};

	const handleUpdateParticipation = async (
		participationId: string,
		patch: ParticipationPatch,
	) => {
		setError("");
		try {
			await api.patch(
				`/categories/${params.categoryId}/participations/${participationId}`,
				patch,
			);
			await loadCategory();
		} catch (err: unknown) {
			setError(
				getErrorMessage(err, "Nu s-a putut actualiza participantul."),
			);
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
				</>
			)}

			{(stage === "DRAFT" || stage === "PUBLISHED") && canManage && (
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
			)}

			{stage === "PUBLISHED" && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-semibold text-[var(--color-blue-900)] text-sm">
							Participanți
						</h3>
						{canManage && (
							<button
								onClick={() => setAddingParticipation(true)}
								className="text-xs text-[var(--color-blue-600)] hover:underline"
							>
								+ Înscrie sportiv
							</button>
						)}
					</div>
					{category.participations.length === 0 ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Niciun sportiv înscris încă.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm border-collapse">
								<thead className="bg-[var(--color-silver-bg)]">
									<tr>
										{["Ordine", "Sportiv", "Cal", "Ora"].map(
											(h) => (
												<th
													key={h}
													className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
												>
													{h}
												</th>
											),
										)}
									</tr>
								</thead>
								<tbody>
									{category.participations.map((p) => (
										<ParticipationRow
											key={p.id}
											participation={p}
											canManage={canManage}
											onSave={(patch) =>
												handleUpdateParticipation(
													p.id,
													patch,
												)
											}
										/>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{addingParticipation && (
				<Modal onClose={() => closeAddParticipationModal()}>
					<ModalHeader
						title="Înscrie sportiv"
						subtitle={category.name}
						onClose={() => closeAddParticipationModal()}
					/>
					<form onSubmit={handleAddParticipation}>
						<ModalBody>
							<div className="flex flex-col gap-3">
								<AthleteCombobox
									athletes={athletes}
									selectedAthleteId={selectedAthleteId}
									onSelect={setSelectedAthleteId}
									onSelected={() =>
										horseNameInputRef.current?.focus()
									}
								/>
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-[var(--color-slate-500)]">
										Nume cal (opțional)
									</label>
									<input
										ref={horseNameInputRef}
										value={horseName}
										onChange={(e) =>
											setHorseName(e.target.value)
										}
										className="border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-blue-600)]"
									/>
								</div>
							</div>
						</ModalBody>
						<ModalFooter>
							<button
								type="button"
								onClick={() => closeAddParticipationModal()}
								className="px-3 py-1.5 text-xs text-[var(--color-slate-500)] hover:text-[var(--color-blue-900)] transition"
							>
								Anulează
							</button>
							<button
								type="submit"
								disabled={!selectedAthleteId}
								className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
							>
								Înscrie
							</button>
						</ModalFooter>
					</form>
				</Modal>
			)}

			{(stage === "ONGOING" || stage === "COMPLETED") && canManage && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<h3 className="font-semibold text-[var(--color-blue-900)] text-sm mb-2">
						{stage === "ONGOING"
							? "Participanți — alege pentru notare"
							: "Rezultate"}
					</h3>
					{category.participations.length === 0 ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Niciun sportiv înscris.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm border-collapse">
								<thead className="bg-[var(--color-silver-bg)]">
									<tr>
										<th
											rowSpan={2}
											className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
										>
											Ordine
										</th>
										<th
											rowSpan={2}
											className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
										>
											Sportiv
										</th>
										<th
											rowSpan={2}
											className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
										>
											Cal
										</th>
										{category.referees.map((r) => (
											<th
												key={r.id}
												colSpan={2}
												className="text-center px-2 py-1.5 text-xs font-semibold text-[var(--color-blue-800)] border border-[var(--color-border)] whitespace-nowrap"
											>
												{r.letterCode} — {r.firstName}{" "}
												{r.lastName}
											</th>
										))}
										<th
											colSpan={2}
											className="text-center px-2 py-1.5 text-xs font-semibold text-[var(--color-blue-900)] border border-[var(--color-border)]"
										>
											Rezultat final
										</th>
										<th
											rowSpan={2}
											className="text-center px-2 py-1.5 text-xs font-semibold text-[var(--color-blue-900)] border border-[var(--color-border)]"
										>
											Loc
										</th>
									</tr>
									<tr>
										{category.referees.map((r) => (
											<Fragment key={r.id}>
												<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
													Scor
												</th>
												<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
													%
												</th>
											</Fragment>
										))}
										<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
											Scor
										</th>
										<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
											%
										</th>
									</tr>
								</thead>
								<tbody>
									{category.participations.map((p) => (
										<tr
											key={p.id}
											onClick={() =>
												router.push(
													`/competitii/${params.id}/categorii/${params.categoryId}/participanti/${p.id}`,
												)
											}
											className="cursor-pointer hover:bg-[var(--color-surface-subtle)] transition-colors"
										>
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
												{p.startOrder ?? "—"}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5 font-semibold text-[var(--color-blue-800)]">
												{p.athleteName}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5">
												{p.horseName ?? "—"}
											</td>
											{category.referees.map((r) => {
												const score =
													p.refereeScores.find(
														(rs) =>
															rs.refereeId ===
															r.id,
													);
												return (
													<Fragment
														key={r.id}
													>
														<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
															{score?.finalScore ??
																"—"}
														</td>
														<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
															{score?.percentage
																? `${formatPercentage(Number(score.percentage))}%`
																: "—"}
														</td>
													</Fragment>
												);
											})}
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
												{p.accumulatedScore !== null
													? p.accumulatedScore.toFixed(
															2,
														)
													: "—"}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
												{p.livePercentage !== null
													? `${formatPercentage(p.livePercentage)}%`
													: "—"}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
												{p.liveRank ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{stage === "ONGOING" && !canManage && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<h3 className="font-semibold text-[var(--color-blue-900)] text-sm mb-2">
						Participanți
					</h3>
					{category.participations.length === 0 ? (
						<p className="text-xs text-[var(--color-slate-500)]">
							Niciun sportiv înscris.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm border-collapse">
								<thead className="bg-[var(--color-silver-bg)]">
									<tr>
										{["Ordine", "Sportiv", "Cal"].map(
											(h) => (
												<th
													key={h}
													className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]"
												>
													{h}
												</th>
											),
										)}
									</tr>
								</thead>
								<tbody>
									{category.participations.map((p) => (
										<tr key={p.id}>
											<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
												{p.startOrder ?? "—"}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5 font-semibold text-[var(--color-blue-800)]">
												{p.athleteName}
											</td>
											<td className="border border-[var(--color-border)] px-2 py-1.5">
												{p.horseName ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{stage === "COMPLETED" && !canManage && (
				<div className="bg-surface rounded-md border border-[var(--color-border)] p-4">
					<h3 className="font-semibold text-[var(--color-blue-900)] text-sm mb-2">
						Rezultate finale
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
											"Procentaj",
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
											if (a.liveRank == null) return 1;
											if (b.liveRank == null) return -1;
											return a.liveRank - b.liveRank;
										})
										.map((p) => (
											<tr key={p.id}>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
													{p.liveRank ?? "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5">
													{p.athleteName}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5">
													{p.horseName ?? "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{p.accumulatedScore !== null
														? p.accumulatedScore.toFixed(
																2,
															)
														: "—"}
												</td>
												<td className="border border-[var(--color-border)] px-2 py-1.5 text-center">
													{p.livePercentage !== null
														? `${formatPercentage(p.livePercentage)}%`
														: "—"}
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
