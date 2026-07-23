"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { CompetitionEventDetail, CategoryDetail } from "@/types";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { formatFullName, formatPercentage } from "@/lib/utils";
import {
	EVENT_STATUS_LABELS,
	EVENT_STATUS_VARIANTS,
} from "@/lib/constants/event-status";

export default function CompetitionViewPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();

	const [event, setEvent] = useState<CompetitionEventDetail | null>(null);
	const [categories, setCategories] = useState<CategoryDetail[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				const { data: eventData } = await api.get<CompetitionEventDetail>(
					`/events/${params.id}`,
				);
				setEvent(eventData);

				const categoryDetails = await Promise.all(
					eventData.categories.map((c) =>
						api.get<CategoryDetail>(`/categories/${c.id}`),
					),
				);
				setCategories(categoryDetails.map((res) => res.data));
			} catch (err) {
				console.error("Failed to load competition view", err);
				setError("Nu s-a putut încărca competiția.");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [params.id]);

	if (loading) {
		return <LoadingState />;
	}
	if (error || !event) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				{error || "Competiția nu a fost găsită."}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push("/competitii")}
				className="text-sm text-[var(--color-blue-600)] hover:underline self-start"
			>
				← Înapoi la competiții
			</button>

			<div className="bg-surface rounded-md border border-[var(--color-border)] p-4 flex flex-col gap-2">
				<div className="flex items-center gap-2 mb-1">
					<Badge variant={EVENT_STATUS_VARIANTS[event.status]}>
						{EVENT_STATUS_LABELS[event.status]}
					</Badge>
				</div>
				<h1 className="text-2xl font-bold text-[var(--color-blue-900)]">
					{event.name}
				</h1>
				{event.location && (
					<p className="text-sm text-[var(--color-slate-500)]">{event.location}</p>
				)}
				{event.description && (
					<p className="text-sm text-[var(--color-slate-500)]">
						{event.description}
					</p>
				)}

				<div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-slate-500)] mt-1">
					{(event.startDate || event.endDate) && (
						<span>
							{event.startDate
								? new Date(event.startDate).toLocaleDateString(
										"ro-RO",
									)
								: "?"}{" "}
							–{" "}
							{event.endDate
								? new Date(event.endDate).toLocaleDateString(
										"ro-RO",
									)
								: "?"}
						</span>
					)}
					<span>
						Secretari:{" "}
						{event.secretaries.length > 0
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

			<h2 className="font-semibold text-[var(--color-blue-900)]">Categorii</h2>

			{categories.length === 0 ? (
				<EmptyState>
					Nicio categorie creată încă pentru acest eveniment.
				</EmptyState>
			) : (
				<div className="flex flex-col gap-4">
					{categories.map((cat) => (
						<div
							key={cat.id}
							className="bg-surface rounded-md border border-[var(--color-border)] p-4 flex flex-col gap-3"
						>
							<div>
								<div className="font-semibold text-[var(--color-blue-900)]">
									{cat.name}
								</div>
								<div className="text-xs text-[var(--color-slate-500)] mt-0.5">
									Protocol: {cat.protocolTemplateName}
								</div>
							</div>

							{cat.referees.length > 0 && (
								<div>
									<div className="text-xs font-semibold text-[var(--color-slate-500)] mb-1">
										Arbitri
									</div>
									<div className="flex flex-wrap gap-2">
										{cat.referees.map((r) => (
											<span
												key={r.id}
												className="text-xs bg-[var(--color-blue-50)] text-[var(--color-blue-800)] px-2 py-1 rounded-md"
											>
												{r.letterCode} — {r.firstName}{" "}
												{r.lastName}
											</span>
										))}
									</div>
								</div>
							)}

							{cat.participations.length > 0 &&
								cat.eventStatus === "COMPLETED" && (
									<div>
										<div className="text-xs font-semibold text-[var(--color-slate-500)] mb-1">
											Rezultate finale
										</div>
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
														{cat.referees.map(
															(r) => (
																<th
																	key={r.id}
																	colSpan={2}
																	className="text-center px-2 py-1.5 text-xs font-semibold text-[var(--color-blue-800)] border border-[var(--color-border)] whitespace-nowrap"
																>
																	{
																		r.letterCode
																	}{" "}
																	—{" "}
																	{
																		r.firstName
																	}{" "}
																	{
																		r.lastName
																	}
																</th>
															),
														)}
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
														{cat.referees.map(
															(r) => (
																<Fragment
																	key={r.id}
																>
																	<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
																		Scor
																	</th>
																	<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
																		%
																	</th>
																</Fragment>
															),
														)}
														<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
															Scor
														</th>
														<th className="text-center px-2 py-1 text-[10px] font-semibold text-[var(--color-slate-500)] border border-[var(--color-border)]">
															%
														</th>
													</tr>
												</thead>
												<tbody>
													{[...cat.participations]
														.sort((a, b) => {
															if (
																a.liveRank ==
																null
															)
																return 1;
															if (
																b.liveRank ==
																null
															)
																return -1;
															return (
																a.liveRank -
																b.liveRank
															);
														})
														.map((p) => (
															<tr key={p.id}>
																<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
																	{p.startOrder ??
																		"—"}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5 font-semibold text-[var(--color-blue-800)]">
																	{
																		p.athleteName
																	}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5">
																	{p.horseName ??
																		"—"}
																</td>
																{cat.referees.map(
																	(r) => {
																		const score =
																			p.refereeScores.find(
																				(
																					rs,
																				) =>
																					rs.refereeId ===
																					r.id,
																			);
																		return (
																			<Fragment
																				key={
																					r.id
																				}
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
																	},
																)}
																<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
																	{p.accumulatedScore !==
																	null
																		? p.accumulatedScore.toFixed(
																				2,
																			)
																		: "—"}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
																	{p.livePercentage !==
																	null
																		? `${formatPercentage(p.livePercentage)}%`
																		: "—"}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold text-[var(--color-blue-900)]">
																	{p.liveRank ??
																		"—"}
																</td>
															</tr>
														))}
												</tbody>
											</table>
										</div>
									</div>
								)}

							{cat.participations.length > 0 &&
								cat.eventStatus !== "COMPLETED" && (
									<div>
										<div className="text-xs font-semibold text-[var(--color-slate-500)] mb-1">
											Participanți
										</div>
										<div className="overflow-x-auto">
											<table className="w-full text-sm border-collapse">
												<thead className="bg-[var(--color-silver-bg)]">
													<tr>
														{[
															"Ordine",
															"Sportiv",
															"Cal",
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
													{cat.participations.map(
														(p) => (
															<tr key={p.id}>
																<td className="border border-[var(--color-border)] px-2 py-1.5 text-center font-semibold">
																	{p.startOrder ??
																		"—"}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5">
																	{p.athleteName}
																</td>
																<td className="border border-[var(--color-border)] px-2 py-1.5">
																	{p.horseName ??
																		"—"}
																</td>
															</tr>
														),
													)}
												</tbody>
											</table>
										</div>
									</div>
								)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
