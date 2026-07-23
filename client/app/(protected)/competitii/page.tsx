"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import TabBar from "@/components/ui/TabBar";
import CompetitionCard from "@/components/competitii/CompetitionCard";
import CompetitionFormModal from "@/components/competitii/CompetitionFormModal";
import api from "@/lib/axios";
import { CompetitionEvent } from "@/types";
import { useCanManage } from "@/lib/hooks/useCanManage";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import DataStrip from "@/components/ui/DataStrip";

export default function CompetitiiPage() {
	const canManage = useCanManage();

	const [competitions, setCompetitions] = useState<CompetitionEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("upcoming");
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		const loadCompetitions = async () => {
			try {
				const { data } = await api.get<CompetitionEvent[]>("/events");
				setCompetitions(data);
			} catch (error) {
				console.error("Failed to load events", error);
			} finally {
				setLoading(false);
			}
		};

		loadCompetitions();
	}, []);

	const now = new Date();
	const isPast = (c: CompetitionEvent) =>
		c.status === "COMPLETED" ||
		(c.startDate ? new Date(c.startDate) < now : false);
	const upcoming = competitions.filter((c) => !isPast(c));
	const past = competitions.filter(isPast);
	const list = tab === "upcoming" ? upcoming : past;

	const summary = [
		{
			key: "open",
			label: "Înscrieri deschise",
			value: competitions.filter((c) => c.status === "PUBLISHED").length,
			dot: "bg-[var(--color-blue-600)]",
		},
		{
			key: "ongoing",
			label: "În desfășurare",
			value: competitions.filter((c) => c.status === "ONGOING").length,
			dot: "bg-amber-400",
		},
		{
			key: "done",
			label: "Finalizate",
			value: competitions.filter((c) => c.status === "COMPLETED").length,
			dot: "bg-emerald-500",
		},
		{
			key: "athletes",
			label: "Total sportivi înscriși",
			value: competitions.reduce((sum, c) => sum + c.participantCount, 0),
			dot: "bg-[var(--color-slate-300)]",
		},
	];

	return (
		<div>
			<PageHeader
				title="Competiții"
				subtitle="Calendar și rezultate ale evenimentelor sportive ale școlii"
				actions={
					canManage && (
						<button
							onClick={() => setCreating(true)}
							className="bg-[var(--color-blue-600)] hover:bg-[var(--color-blue-800)] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
						>
							+ Creează competiție
						</button>
					)
				}
			/>

			{!loading && competitions.length > 0 && (
				<DataStrip items={summary} className="mb-6" />
			)}

			<TabBar
				tabs={[
					{
						key: "upcoming",
						label: "Viitoare",
						count: upcoming.length,
					},
					{ key: "past", label: "Trecute", count: past.length },
				]}
				active={tab}
				onChange={setTab}
			/>

			{loading ? (
				<LoadingState />
			) : list.length === 0 ? (
				<EmptyState>Nicio competiție găsită.</EmptyState>
			) : (
				<div className="grid grid-cols-2 gap-4">
					{list.map((c) => (
						<CompetitionCard
							key={c.id}
							competition={c}
							canManage={canManage}
						/>
					))}
				</div>
			)}

			{creating && canManage && (
				<CompetitionFormModal
					competition={null}
					onClose={() => setCreating(false)}
					onSaved={(saved) =>
						setCompetitions((prev) => [saved, ...prev])
					}
				/>
			)}
		</div>
	);
}
