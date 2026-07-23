"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import FilterSegment from "@/components/ui/FilterSegment";
import AthleteTable from "@/components/sportivi/AthleteTable";
import AthleteGrid from "@/components/sportivi/AthleteGrid";
import AthleteFormModal from "@/components/sportivi/AthleteFormModal";
import api from "@/lib/axios";
import { Athlete } from "@/types";
import { getErrorMessage } from "@/lib/error";
import { useCanManage } from "@/lib/hooks/useCanManage";
import { formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";

const viewOptions = [
	{ key: "table", label: "Tabel" },
	{ key: "grid", label: "Carduri" },
];

export default function SportiviPage() {
	const canManage = useCanManage();

	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState("");
	const [view, setView] = useState("table");
	const [adding, setAdding] = useState(false);
	const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
	const [actionError, setActionError] = useState("");

	useEffect(() => {
		const loadAthletes = async () => {
			try {
				const { data } = await api.get<Athlete[]>("/athletes");
				setAthletes(data);
			} catch (error) {
				console.error("Failed to load athletes", error);
			} finally {
				setLoading(false);
			}
		};

		loadAthletes();
	}, []);

	const handleDelete = async (athlete: Athlete) => {
		const name = formatFullName(
			athlete.firstName,
			athlete.lastName,
			athlete.email,
		);
		if (!window.confirm(`Ștergi sportivul ${name}?`)) return;

		setActionError("");
		try {
			await api.delete(`/athletes/${athlete.id}`);
			setAthletes((prev) => prev.filter((a) => a.id !== athlete.id));
		} catch (err: unknown) {
			setActionError(getErrorMessage(err, "Nu s-a putut șterge sportivul."));
		}
	};

	const list = athletes.filter((a) => {
		if (!q) return true;
		const haystack =
			`${a.firstName ?? ""} ${a.lastName ?? ""} ${a.email}`.toLowerCase();
		return haystack.includes(q.toLowerCase());
	});

	return (
		<div>
			<PageHeader
				title="Sportivi"
				subtitle={`${list.length} sportivi`}
				actions={
					canManage && (
						<button
							onClick={() => setAdding(true)}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
						>
							+ Adaugă sportiv
						</button>
					)
				}
			/>

			<div className="flex items-center gap-3 flex-wrap mb-6">
				<SearchInput
					value={q}
					onChange={setQ}
					placeholder="Caută sportiv…"
					className="flex-1 max-w-sm"
				/>
				<FilterSegment
					options={viewOptions}
					active={view}
					onChange={setView}
				/>
			</div>

			{actionError && (
				<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
					{actionError}
				</div>
			)}

			{loading ? (
				<LoadingState className="text-[var(--color-slate-500)]" />
			) : view === "table" ? (
				<AthleteTable
					athletes={list}
					onEdit={canManage ? setEditingAthlete : undefined}
					onDelete={canManage ? handleDelete : undefined}
				/>
			) : (
				<AthleteGrid
					athletes={list}
					onEdit={canManage ? setEditingAthlete : undefined}
					onDelete={canManage ? handleDelete : undefined}
				/>
			)}

			{(adding || editingAthlete) && canManage && (
				<AthleteFormModal
					athlete={editingAthlete}
					onClose={() => {
						setAdding(false);
						setEditingAthlete(null);
					}}
					onSaved={(saved) =>
						setAthletes((prev) =>
							editingAthlete
								? prev.map((a) =>
										a.id === saved.id ? saved : a,
									)
								: [saved, ...prev],
						)
					}
				/>
			)}
		</div>
	);
}
