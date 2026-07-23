"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import CoachCard from "@/components/antrenori/CoachCard";
import AddCoachModal from "@/components/antrenori/AddCoachModal";
import EditCoachModal from "@/components/antrenori/EditCoachModal";
import api from "@/lib/axios";
import { Coach } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import DataStrip from "@/components/ui/DataStrip";

export default function AntrenoriPage() {
	const canManage = useCanManage();

	const [coaches, setCoaches] = useState<Coach[]>([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState("");
	const [adding, setAdding] = useState(false);
	const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
	const [deleteError, setDeleteError] = useState("");

	useEffect(() => {
		const loadCoaches = async () => {
			try {
				const { data } = await api.get<Coach[]>("/coaches");
				setCoaches(data);
			} catch (error) {
				console.error("Failed to load coaches", error);
			} finally {
				setLoading(false);
			}
		};

		loadCoaches();
	}, []);

	const handleDelete = async (coach: Coach) => {
		const fullName = formatFullName(coach.firstName, coach.lastName, coach.email);
		if (!window.confirm(`Ștergi antrenorul ${fullName}?`)) return;

		setDeleteError("");
		try {
			await api.delete(`/coaches/${coach.id}`);
			setCoaches((prev) => prev.filter((c) => c.id !== coach.id));
		} catch (err: unknown) {
			setDeleteError(
				getErrorMessage(err, "Nu s-a putut șterge antrenorul."),
			);
		}
	};

	const list = coaches.filter((c) => {
		if (!q) return true;
		const haystack =
			`${c.firstName ?? ""} ${c.lastName ?? ""} ${c.email}`.toLowerCase();
		return haystack.includes(q.toLowerCase());
	});

	const coveredGroups = new Set(
		coaches.flatMap((c) => c.groups.map((g) => g.id)),
	).size;
	const withoutGroup = coaches.filter((c) => c.groups.length === 0).length;

	const summary = [
		{ key: "coaches", label: "Antrenori", value: coaches.length },
		{ key: "groups", label: "Grupe acoperite", value: coveredGroups },
		{
			key: "no-group",
			label: "Fără grupă asignată",
			value: withoutGroup,
		},
	];

	return (
		<div>
			<PageHeader
				title="Antrenori"
				subtitle="Cadrele didactice ale școlii. Gestionează contul și grupele asociate."
				actions={
					canManage && (
						<button
							onClick={() => setAdding(true)}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							+ Adaugă antrenor
						</button>
					)
				}
			/>

			{!loading && coaches.length > 0 && (
				<DataStrip items={summary} className="mb-6" />
			)}

			<div className="flex items-center gap-3 flex-wrap mb-6">
				<SearchInput
					value={q}
					onChange={setQ}
					placeholder="Caută antrenor sau email…"
					className="flex-1 max-w-sm"
				/>
				<span className="text-[var(--color-slate-400)] text-sm ml-auto">
					{list.length} rezultate
				</span>
			</div>

			{deleteError && (
				<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{deleteError}
				</div>
			)}

			{loading ? (
				<LoadingState className="text-[var(--color-slate-500)]" />
			) : list.length === 0 ? (
				<EmptyState>Niciun antrenor găsit.</EmptyState>
			) : (
				<div className="grid grid-cols-3 gap-4">
					{list.map((c) => (
						<CoachCard
							key={c.id}
							coach={c}
							onEdit={canManage ? setEditingCoach : undefined}
							onDelete={canManage ? handleDelete : undefined}
						/>
					))}
				</div>
			)}

			{adding && canManage && (
				<AddCoachModal
					onClose={() => setAdding(false)}
					onCreated={(coach) =>
						setCoaches((prev) => [coach, ...prev])
					}
				/>
			)}

			{editingCoach && canManage && (
				<EditCoachModal
					coach={editingCoach}
					onClose={() => setEditingCoach(null)}
					onUpdated={(updated) =>
						setCoaches((prev) =>
							prev.map((c) =>
								c.id === updated.id ? updated : c,
							),
						)
					}
				/>
			)}
		</div>
	);
}
