"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
	CategoryDetail,
	Category,
	CompetitionEvent,
	EventStatus,
	ProtocolTemplate,
} from "@/types";
import CompetitionFormModal from "@/components/competitii/CompetitionFormModal";
import Badge from "@/components/ui/Badge";
import Panel from "@/components/ui/Panel";
import FilterSegment from "@/components/ui/FilterSegment";
import {
	EVENT_STATUS_LABELS,
	EVENT_STATUS_VARIANTS,
	EVENT_STATUS_OPTIONS,
} from "@/lib/constants/event-status";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

const statusLabels = EVENT_STATUS_LABELS;
const statusVariants = EVENT_STATUS_VARIANTS;
const statusOptions: EventStatus[] = EVENT_STATUS_OPTIONS.map(
	(o) => o.value,
);

const nextStatus: Partial<Record<EventStatus, EventStatus>> = {
	DRAFT: "PUBLISHED",
	PUBLISHED: "ONGOING",
	ONGOING: "COMPLETED",
};

const nextStatusLabel: Partial<Record<EventStatus, string>> = {
	DRAFT: "Publică",
	PUBLISHED: "Trece la În desfășurare",
	ONGOING: "Finalizează",
};

type CatProgress = "EVALUATA" | "IN_CURS" | "DE_EVALUAT";

function categoryProgress(cat: CategoryDetail): {
	status: CatProgress;
	scored: number;
	total: number;
} {
	const total = cat.participations.length;
	// livePercentage is set as soon as any referee scores a participant;
	// finalScore only lands once the category is officially finalized.
	const scored = cat.participations.filter(
		(p) => p.livePercentage !== null,
	).length;
	const finalized = cat.participations.filter(
		(p) => p.finalScore !== null,
	).length;
	const status: CatProgress =
		total === 0 || scored === 0
			? "DE_EVALUAT"
			: finalized === total
				? "EVALUATA"
				: "IN_CURS";
	return { status, scored, total };
}

export default function EventManagePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const canManage = useCanManage();

	const [event, setEvent] = useState<CompetitionEvent | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryDetails, setCategoryDetails] = useState<CategoryDetail[]>(
		[],
	);
	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);

	const [editing, setEditing] = useState(false);
	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [templateId, setTemplateId] = useState("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const [statusSaving, setStatusSaving] = useState(false);
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		if (!canManage) {
			router.replace(`/competitii/${params.id}/vizualizare`);
		}
	}, [canManage, params.id, router]);

	useEffect(() => {
		if (!canManage) return;
		const load = async () => {
			try {
				const [eventsRes, categoriesRes, templatesRes] =
					await Promise.all([
						api.get<CompetitionEvent[]>("/events"),
						api.get<Category[]>(
							`/events/${params.id}/categories`,
						),
						api.get<ProtocolTemplate[]>("/protocol-templates"),
					]);
				setEvent(
					eventsRes.data.find((e) => e.id === params.id) ?? null,
				);
				setCategories(categoriesRes.data);
				setTemplates(templatesRes.data);

				const details = await Promise.all(
					categoriesRes.data.map((c) =>
						api.get<CategoryDetail>(`/categories/${c.id}`),
					),
				);
				setCategoryDetails(details.map((d) => d.data));
			} catch (err) {
				console.error("Failed to load event management data", err);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [params.id]);

	const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			const { data } = await api.post<Category>(
				`/events/${params.id}/categories`,
				{ name, protocolTemplateId: templateId },
			);
			setCategories((prev) => [data, ...prev]);
			setName("");
			setTemplateId("");
			setAdding(false);
		} catch (err: unknown) {
			setError(getErrorMessage(err, "Nu s-a putut crea categoria."));
		} finally {
			setSaving(false);
		}
	};

	const handleStatusChange = async (status: EventStatus) => {
		if (!event || status === event.status) return;
		setStatusSaving(true);
		setError("");
		try {
			const { data } = await api.patch<CompetitionEvent>(
				`/events/${event.id}`,
				{ status },
			);
			setEvent(data);
		} catch (err: unknown) {
			setError(
				getErrorMessage(err, "Nu s-a putut schimba starea competiției."),
			);
		} finally {
			setStatusSaving(false);
		}
	};

	if (loading) {
		return <LoadingState />;
	}

	const isDraft = event?.status === "DRAFT";
	const canEdit = canManage && isDraft;

	const detailsById = new Map(categoryDetails.map((d) => [d.id, d]));

	const rows = categories.map((c) => {
		const detail = detailsById.get(c.id);
		const progress = detail
			? categoryProgress(detail)
			: { status: "DE_EVALUAT" as CatProgress, scored: 0, total: 0 };
		return { category: c, detail, progress };
	});

	const totalCategories = rows.length;
	const evaluatedCount = rows.filter(
		(r) => r.progress.status === "EVALUATA",
	).length;
	const scoringPct =
		totalCategories > 0
			? Math.round((evaluatedCount / totalCategories) * 100)
			: 0;

	const totalParticipants = categories.reduce(
		(sum, c) => sum + c.participationCount,
		0,
	);
	const competed = categoryDetails.reduce(
		(sum, d) =>
			sum + d.participations.filter((p) => p.status === "COMPETED").length,
		0,
	);
	const withdrawn = categoryDetails.reduce(
		(sum, d) =>
			sum +
			d.participations.filter((p) => p.status === "WITHDRAWN").length,
		0,
	);
	const disqualified = categoryDetails.reduce(
		(sum, d) =>
			sum +
			d.participations.filter((p) => p.status === "DISQUALIFIED")
				.length,
		0,
	);

	const uniqueReferees = new Map(
		categoryDetails.flatMap((d) => d.referees.map((r) => [r.id, r])),
	);

	const activeRow = rows.find((r) => r.progress.status === "IN_CURS");

	const filteredRows = rows.filter((r) => {
		if (filter === "in-curs") return r.progress.status === "IN_CURS";
		if (filter === "de-evaluat")
			return r.progress.status === "DE_EVALUAT";
		return true;
	});

	const progressLabel: Record<CatProgress, { text: string; variant: "warning" | "success" | "gray" }> = {
		IN_CURS: { text: "● ÎN CURS", variant: "warning" },
		EVALUATA: { text: "EVALUATĂ", variant: "success" },
		DE_EVALUAT: { text: "DE EVALUAT", variant: "gray" },
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="text-[12.5px] text-slate-500">
				<Link href="/competitii" className="hover:text-blue-600 transition-colors">
					Competiții
				</Link>{" "}
				<span className="opacity-50">/</span>{" "}
				<span className="text-ink-800">{event?.name ?? "Competiție"}</span>
			</div>

			{error && !adding && (
				<div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{error}
				</div>
			)}

			<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-border-soft">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						{event && (
							<Badge variant={statusVariants[event.status]}>
								{statusLabels[event.status]}
							</Badge>
						)}
					</div>
					<h1 className="text-[26px] sm:text-[32px] font-bold text-ink-800 tracking-[-0.02em]">
						{event?.name ?? "Competiție"}
					</h1>
					<div className="text-[13px] text-slate-500">
						{[
							event?.location,
							event?.startDate
								? new Date(event.startDate).toLocaleDateString(
										"ro-RO",
									)
								: null,
							`Secretari: ${
								event?.secretaries && event.secretaries.length > 0
									? event.secretaries
											.map((s) =>
												formatFullName(
													s.firstName,
													s.lastName,
													s.email,
												),
											)
											.join(", ")
									: "niciunul asignat"
							}`,
						]
							.filter(Boolean)
							.join(" · ")}
					</div>
				</div>

				<div className="flex gap-2 flex-shrink-0">
					{canEdit && (
						<button
							onClick={() => setEditing(true)}
							className="border border-border hover:border-blue-600 text-blue-600 text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200"
						>
							Editează
						</button>
					)}
					<Link
						href={`/competitii/${params.id}/vizualizare`}
						className="bg-blue-600 hover:bg-blue-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200"
					>
						Afișaj live
					</Link>
				</div>
			</div>

			{editing && event && canManage && (
				<CompetitionFormModal
					competition={event}
					onClose={() => setEditing(false)}
					onSaved={(saved) => setEvent(saved)}
				/>
			)}

			{/* stats strip */}
			<div className="grid grid-cols-2 lg:grid-cols-4 bg-surface border border-border rounded-lg shadow-[var(--shadow-panel)] overflow-hidden">
				<div className="p-4 lg:border-r border-border-soft">
					<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
						Progres scoring
					</div>
					<div className="flex items-baseline gap-1.5 mt-1.5 mb-2">
						<span className="font-mono text-[28px] font-bold text-ink-800 leading-none">
							{evaluatedCount}
						</span>
						<span className="text-[12.5px] text-slate-500">
							/ {totalCategories} categorii evaluate
						</span>
					</div>
					<div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
						<div
							className="h-full bg-blue-600 rounded-full transition-all duration-500"
							style={{ width: `${scoringPct}%` }}
						/>
					</div>
				</div>
				<div className="p-4 lg:border-r border-border-soft">
					<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
						Participanți
					</div>
					<div className="font-mono text-[28px] font-bold text-ink-800 leading-none mt-1.5 mb-1">
						{totalParticipants}
					</div>
					<div className="text-[11.5px] text-slate-500">
						{competed} au concurat · {withdrawn} retrași ·{" "}
						{disqualified} descalificați
					</div>
				</div>
				<div className="p-4 lg:border-r border-border-soft">
					<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
						Arbitri
					</div>
					<div className="font-mono text-[28px] font-bold text-ink-800 leading-none mt-1.5 mb-1">
						{uniqueReferees.size}
					</div>
					<div className="text-[11.5px] text-slate-500">
						{[...uniqueReferees.values()]
							.map((r) => r.letterCode)
							.join(", ") || "neasignați"}
					</div>
				</div>
				<div className="p-4">
					<div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
						Categoria activă
					</div>
					<div className="font-bold text-[16px] text-ink-800 leading-snug mt-1.5">
						{activeRow?.category.name ?? "—"}
					</div>
					<div className="text-[11.5px] text-slate-500 mt-0.5">
						{activeRow
							? `notare în curs · ${activeRow.progress.scored} din ${activeRow.progress.total}`
							: "nicio categorie activă"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 items-start">
				{/* categories */}
				<section className="flex flex-col gap-3.5">
					<div className="flex items-center justify-between">
						<h2 className="font-bold text-[15px] text-ink-800">
							Categorii <span className="font-normal text-slate-500">· {totalCategories}</span>
						</h2>
						<div className="flex items-center gap-2">
							<FilterSegment
								options={[
									{ key: "all", label: "Toate" },
									{ key: "in-curs", label: "În curs" },
									{ key: "de-evaluat", label: "De evaluat" },
								]}
								active={filter}
								onChange={setFilter}
							/>
							{canEdit && (
								<button
									onClick={() => setAdding((v) => !v)}
									className="bg-blue-600 hover:bg-blue-800 text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
								>
									+ Categorie
								</button>
							)}
						</div>
					</div>

					{adding && canEdit && (
						<form
							onSubmit={handleCreate}
							className="bg-surface rounded-lg border border-border p-4 flex flex-col gap-3"
						>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-slate-500">
									Nume categorie
								</label>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									placeholder="ex: Categoria Începători Feminin/Masculin"
									className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-slate-500">
									Protocol
								</label>
								<select
									value={templateId}
									onChange={(e) => setTemplateId(e.target.value)}
									required
									className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
								>
									<option value="">Alege un protocol</option>
									{templates.map((t) => (
										<option key={t.id} value={t.id}>
											{t.name}
											{t.level ? ` — ${t.level}` : ""}
										</option>
									))}
								</select>
							</div>

							{error && (
								<div className="text-xs text-red-500">{error}</div>
							)}

							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setAdding(false)}
									className="px-4 py-2 text-sm text-slate-500 hover:text-ink-800 transition"
								>
									Anulează
								</button>
								<button
									type="submit"
									disabled={saving}
									className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
								>
									{saving ? "Se salvează..." : "Creează"}
								</button>
							</div>
						</form>
					)}

					{filteredRows.length === 0 ? (
						<EmptyState>
							{categories.length === 0
								? "Nicio categorie creată încă pentru acest eveniment."
								: "Nicio categorie nu corespunde filtrului selectat."}
						</EmptyState>
					) : (
						<div className="bg-surface rounded-lg border border-border shadow-[var(--shadow-panel)] overflow-hidden">
							{filteredRows.map((r, i) => {
								const label = progressLabel[r.progress.status];
								const pct =
									r.progress.total > 0
										? Math.round(
												(r.progress.scored /
													r.progress.total) *
													100,
											)
										: 0;
								const winner =
									r.progress.status === "EVALUATA"
										? [...(r.detail?.participations ?? [])].sort(
												(a, b) =>
													(a.rank ?? 999) -
													(b.rank ?? 999),
											)[0]
										: null;
								return (
									<div
										key={r.category.id}
										className={`grid grid-cols-1 sm:grid-cols-[1fr_150px_110px] items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-surface-subtle transition-colors duration-200 ${i > 0 ? "border-t border-border-soft" : ""}`}
									>
										<div className="min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<Badge variant={label.variant}>
													{label.text}
												</Badge>
												<span className="text-[11px] text-slate-500 truncate">
													{r.category.protocolTemplateName}
												</span>
											</div>
											<div className="font-bold text-[16px] text-ink-800 truncate">
												{r.category.name}
											</div>
											<div className="text-[11.5px] text-slate-500 mt-0.5">
												{r.category.participationCount} participanți ·{" "}
												{r.category.refereeCount} arbitri
												{winner &&
													` · învingător: ${winner.athleteName}`}
											</div>
										</div>
										<div>
											<div className="text-[11px] text-slate-500 mb-1">
												{r.progress.scored} / {r.progress.total} notați
											</div>
											<div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
												<div
													className="h-full bg-blue-600 rounded-full transition-all duration-500"
													style={{ width: `${pct}%` }}
												/>
											</div>
										</div>
										<div className="text-left sm:text-right">
											<Link
												href={`/competitii/${params.id}/categorii/${r.category.id}`}
												className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
											>
												{r.progress.status === "EVALUATA"
													? "Rezultate →"
													: "Deschide →"}
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>

				{/* right rail */}
				<div className="flex flex-col gap-4">
					<Panel
						title="Clasament live"
						subtitle={activeRow?.category.name}
						noBodyPadding
					>
						{!activeRow || activeRow.progress.total === 0 ? (
							<div className="px-5 py-6 text-[12.5px] text-slate-500">
								Nicio categorie activă în acest moment.
							</div>
						) : (
							[...activeRow.detail!.participations]
								.sort((a, b) => {
									if (a.liveRank == null) return 1;
									if (b.liveRank == null) return -1;
									return a.liveRank - b.liveRank;
								})
								.slice(0, 5)
								.map((p, i) => (
									<div
										key={p.id}
										className={`flex items-center gap-3 px-5 py-2.5 ${i > 0 ? "border-t border-border-soft" : ""} ${p.finalScore === null ? "bg-blue-50" : ""}`}
									>
										<div className="w-5 text-center text-[13px] font-bold text-slate-500 flex-shrink-0">
											{p.liveRank ?? i + 1}
										</div>
										<div className="min-w-0 flex-1">
											<div className="font-semibold text-[13px] text-ink-800 truncate flex items-center gap-1.5">
												{p.athleteName}
												{p.finalScore === null && (
													<Badge variant="warning">PE PISTĂ</Badge>
												)}
											</div>
											{p.horseName && (
												<div className="text-[11px] text-slate-500 truncate">
													cal: {p.horseName}
												</div>
											)}
										</div>
										<div className="font-mono text-[15px] font-bold text-ink-800 flex-shrink-0">
											{p.livePercentage !== null
												? `${p.livePercentage.toFixed(1)}%`
												: "—"}
										</div>
									</div>
								))
						)}
					</Panel>

					<Panel title="Arbitri atribuiți">
						{uniqueReferees.size === 0 ? (
							<div className="text-[12.5px] text-slate-500">
								Niciun arbitru asignat încă.
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{[...uniqueReferees.values()].map((r) => (
									<div key={r.id} className="flex items-center gap-2.5">
										<div className="w-7 h-7 rounded-md bg-blue-50 text-blue-800 grid place-items-center font-bold text-[11px] flex-shrink-0">
											{r.letterCode}
										</div>
										<div className="min-w-0 flex-1">
											<div className="font-semibold text-[13px] text-ink-800 truncate">
												{r.firstName} {r.lastName}
											</div>
											<div className="text-[11px] text-slate-500 truncate">
												Poziția {r.letterCode}
												{r.position ? ` · ${r.position}` : ""}
											</div>
										</div>
										<Badge variant="success">Activ</Badge>
									</div>
								))}
							</div>
						)}
					</Panel>
				</div>
			</div>

			{canManage && event && (
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
					<div className="flex items-center gap-2">
						<label className="text-xs font-medium text-slate-500">
							Schimbă starea competiției
						</label>
						<select
							value={event.status}
							disabled={statusSaving}
							onChange={(e) =>
								handleStatusChange(
									e.target.value as EventStatus,
								)
							}
							className="border border-border rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-blue-600 disabled:opacity-50"
						>
							{statusOptions.map((s) => (
								<option key={s} value={s}>
									{statusLabels[s]}
								</option>
							))}
						</select>
					</div>

					{nextStatus[event.status] && (
						<button
							onClick={() =>
								handleStatusChange(nextStatus[event.status]!)
							}
							disabled={statusSaving}
							className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
						>
							{statusSaving
								? "Se salvează..."
								: nextStatusLabel[event.status]}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
