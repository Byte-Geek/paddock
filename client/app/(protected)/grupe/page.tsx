"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import GroupCard from "@/components/grupe/GroupCard";
import GroupModal from "@/components/grupe/GroupModal";
import GroupFormModal from "@/components/grupe/GroupFormModal";
import api from "@/lib/axios";
import { Group } from "@/types";

export default function GrupePage() {
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
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-a putut șterge grupa.";
			setActionError(Array.isArray(message) ? message.join(", ") : message);
		}
	};

	const list = q
		? groups.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
		: groups;

	return (
		<div>
			<PageHeader
				title="Grupe"
				subtitle="Categorii de pregătire, cu sportivi și antrenori responsabili."
				actions={
					<button
						onClick={() => setAdding(true)}
						className="bg-[#4a7adb] hover:bg-[#3a6acb] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
					>
						+ Adaugă grupă
					</button>
				}
			/>

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
				<div className="text-sm text-[#8896b3]">Se încarcă...</div>
			) : list.length === 0 ? (
				<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
					Nicio grupă găsită.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4">
					{list.map((g) => (
						<GroupCard
							key={g.id}
							group={g}
							onDetails={() => setOpenGroup(g)}
							onEdit={() => setEditingGroup(g)}
							onDelete={() => handleDelete(g)}
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

			{(adding || editingGroup) && (
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
