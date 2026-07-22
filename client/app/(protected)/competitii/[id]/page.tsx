"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { Category, CompetitionEvent, ProtocolTemplate } from "@/types";

export default function EventManagePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const canManage = user?.role === "ADMIN";

	const [event, setEvent] = useState<CompetitionEvent | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
	const [loading, setLoading] = useState(true);

	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [templateId, setTemplateId] = useState("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

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
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut crea categoria.";
			setError(Array.isArray(message) ? message.join(", ") : message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="text-sm text-[#6b7d92]">Se încarcă...</div>;
	}

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push("/competitii")}
				className="text-sm text-[#2a6aa6] hover:underline self-start"
			>
				← Înapoi la competiții
			</button>

			<div>
				<h1 className="text-2xl font-bold text-[#0e1f33]">
					{event?.name ?? "Competiție"}
				</h1>
				{event?.location && (
					<p className="text-sm text-[#6b7d92] mt-1">
						{event.location}
					</p>
				)}
			</div>

			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-[#0e1f33]">Categorii</h2>
				{canManage && (
					<button
						onClick={() => setAdding((v) => !v)}
						className="bg-[#2a6aa6] hover:bg-[#205280] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition"
					>
						+ Adaugă categorie
					</button>
				)}
			</div>

			{adding && canManage && (
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
				<div className="rounded-[10px] border border-[#e2e8f0] bg-white p-6 text-sm text-[#6b7d92]">
					Nicio categorie creată încă pentru acest eveniment.
				</div>
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
							<span className="text-[#2a6aa6] text-sm font-semibold">
								Notează →
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
