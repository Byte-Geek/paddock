"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Category, CompetitionEvent, EventStatus, ProtocolTemplate } from "@/types";
import CompetitionFormModal from "@/components/competitii/CompetitionFormModal";
import Badge from "@/components/ui/Badge";
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

export default function EventManagePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const canManage = useCanManage();

	const [event, setEvent] = useState<CompetitionEvent | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);

	const [editing, setEditing] = useState(false);
	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [templateId, setTemplateId] = useState("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const [statusSaving, setStatusSaving] = useState(false);

	useEffect(() => {
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

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push("/competitii")}
				className="text-sm text-[#2a6aa6] hover:underline self-start"
			>
				← Înapoi la competiții
			</button>

			{error && !adding && (
				<div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{error}
				</div>
			)}

			<div className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 flex items-start justify-between gap-4">
				<div className="flex flex-col gap-2">
					<div>
						<div className="flex items-center gap-2 mb-1">
							{event && (
								<Badge variant={statusVariants[event.status]}>
									{statusLabels[event.status]}
								</Badge>
							)}
						</div>
						<h1 className="text-2xl font-bold text-[#0e1f33]">
							{event?.name ?? "Competiție"}
						</h1>
						{event?.location && (
							<p className="text-sm text-[#6b7d92] mt-1">
								{event.location}
							</p>
						)}
					</div>

					{event?.description && (
						<p className="text-sm text-[#6b7d92]">
							{event.description}
						</p>
					)}

					<div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#6b7d92]">
						{(event?.startDate || event?.endDate) && (
							<span>
								{event?.startDate
									? new Date(
											event.startDate,
										).toLocaleDateString("ro-RO")
									: "?"}{" "}
								–{" "}
								{event?.endDate
									? new Date(
											event.endDate,
										).toLocaleDateString("ro-RO")
									: "?"}
							</span>
						)}
						<span>
							Secretari:{" "}
							{event?.secretaries && event.secretaries.length > 0
								? event.secretaries
										.map((s) =>
											formatFullName(
												s.firstName,
												s.lastName,
												s.email,
											),
										)
										.join(", ")
								: "niciunul asignat"}
						</span>
					</div>
				</div>

				{canEdit && (
					<button
						onClick={() => setEditing(true)}
						className="shrink-0 border border-[#e2e8f0] hover:border-[#2a6aa6] text-[#2a6aa6] text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						Editează competiția
					</button>
				)}
			</div>

			{editing && event && canManage && (
				<CompetitionFormModal
					competition={event}
					onClose={() => setEditing(false)}
					onSaved={(saved) => setEvent(saved)}
				/>
			)}

			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-[#0e1f33]">Categorii</h2>
				{canEdit && (
					<button
						onClick={() => setAdding((v) => !v)}
						className="bg-[#2a6aa6] hover:bg-[#205280] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						+ Adaugă categorie
					</button>
				)}
			</div>

			{adding && canEdit && (
				<form
					onSubmit={handleCreate}
					className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 flex flex-col gap-3"
				>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#6b7d92]">
							Nume categorie
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder="ex: Categoria Începători Feminin/Masculin"
							className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-[#6b7d92]">
							Protocol
						</label>
						<select
							value={templateId}
							onChange={(e) => setTemplateId(e.target.value)}
							required
							className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2a6aa6]"
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
							className="px-4 py-2 text-sm text-[#6b7d92] hover:text-[#0e1f33] transition"
						>
							Anulează
						</button>
						<button
							type="submit"
							disabled={saving}
							className="bg-[#2a6aa6] hover:bg-[#205280] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							{saving ? "Se salvează..." : "Creează"}
						</button>
					</div>
				</form>
			)}

			{categories.length === 0 ? (
				<EmptyState>
					Nicio categorie creată încă pentru acest eveniment.
				</EmptyState>
			) : (
				<div className="flex flex-col gap-3">
					{categories.map((c) => (
						<Link
							key={c.id}
							href={`/competitii/${params.id}/categorii/${c.id}`}
							className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 flex items-center justify-between hover:shadow-[0_4px_16px_-4px_rgba(14,39,64,0.08)] transition"
						>
							<div>
								<div className="font-semibold text-[#0e1f33]">
									{c.name}
								</div>
								<div className="text-xs text-[#6b7d92] mt-0.5">
									Protocol: {c.protocolTemplateName} ·{" "}
									{c.participationCount} participanți ·{" "}
									{c.refereeCount} arbitri
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			{canManage && event && (
				<div className="flex justify-between items-center gap-3">
					<div className="flex items-center gap-2">
						<label className="text-xs font-medium text-[#6b7d92]">
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
							className="border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#2a6aa6] disabled:opacity-50"
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
							className="bg-[#2a6aa6] hover:bg-[#205280] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] transition"
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
