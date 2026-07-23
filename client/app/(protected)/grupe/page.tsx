"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import GroupCard from "@/components/grupe/GroupCard";
import GroupModal from "@/components/grupe/GroupModal";
import GroupFormModal from "@/components/grupe/GroupFormModal";
import api from "@/lib/axios";
import { Group } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import DataStrip from "@/components/ui/DataStrip";

export default function GrupePage() {
	const canManage = useCanManage();

	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState("");
	const [openGroup, setOpenGroup] = useState<Group | null>(null);
	const [editingGroup, setEditingGroup] = useState<Group | null>(null);
	const [adding, setAdding] = useState(false);
	const [actionError, setActionError] = useState("");

	useEffect(() => {
		const loadGroups = async () => {
			try {
				const { data } = await api.get<Group[]>("/groups");
				setGroups(data);
			} catch (error) {
				console.error("Failed to load groups", error);
			} finally {
				setLoading(false);
			}
		};

		loadGroups();
	}, []);

	const handleDelete = async (group: Group) => {
		if (!window.confirm(`Ștergi grupa ${group.name}?`)) return;

		setActionError("");
		try {
			await api.delete(`/groups/${group.id}`);
			setGroups((prev) => prev.filter((g) => g.id !== group.id));
		} catch (err: unknown) {
			setActionError(getErrorMessage(err, "Nu s-a putut șterge grupa."));
		}
	};

	const list = q
		? groups.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
		: groups;

	const totalAthletes = groups.reduce((sum, g) => sum + g.athleteCount, 0);
	const avgSize = groups.length
		? Math.round((totalAthletes / groups.length) * 10) / 10
		: 0;
	const largest = groups.reduce(
		(max, g) => (g.athleteCount > max ? g.athleteCount : max),
		0,
	);

	const summary = [
		{ key: "groups", label: "Grupe", value: groups.length },
		{
			key: "athletes",
			label: "Sportivi în grupe",
			value: totalAthletes,
		},
		{ key: "avg", label: "Medie / grupă", value: avgSize },
		{ key: "max", label: "Cea mai numeroasă", value: largest },
	];

	return (
		<div>
			<PageHeader
				title="Grupe"
				subtitle="Categorii de pregătire, cu sportivi și antrenori responsabili."
				actions={
					canManage && (
						<button
							onClick={() => setAdding(true)}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							+ Adaugă grupă
						</button>
					)
				}
			/>

			{!loading && groups.length > 0 && (
				<DataStrip items={summary} className="mb-6" />
			)}

			<div className="mb-6">
				<SearchInput
					value={q}
					onChange={setQ}
					placeholder="Caută grupă…"
					className="max-w-sm"
				/>
			</div>

			{actionError && (
				<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{actionError}
				</div>
			)}

			{loading ? (
				<LoadingState className="text-[var(--color-slate-500)]" />
			) : list.length === 0 ? (
				<EmptyState>Nicio grupă găsită.</EmptyState>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{list.map((g) => (
						<GroupCard
							key={g.id}
							group={g}
							onDetails={() => setOpenGroup(g)}
							onEdit={
								canManage
									? () => setEditingGroup(g)
									: undefined
							}
							onDelete={
								canManage
									? () => handleDelete(g)
									: undefined
							}
						/>
					))}
				</div>
			)}

			{openGroup && (
				<GroupModal
					group={openGroup}
					onClose={() => setOpenGroup(null)}
				/>
			)}

			{(adding || editingGroup) && canManage && (
				<GroupFormModal
					group={editingGroup}
					onClose={() => {
						setAdding(false);
						setEditingGroup(null);
					}}
					onSaved={(saved) =>
						setGroups((prev) =>
							editingGroup
								? prev.map((g) =>
										g.id === saved.id ? saved : g,
									)
								: [saved, ...prev],
						)
					}
				/>
			)}
		</div>
	);
}
