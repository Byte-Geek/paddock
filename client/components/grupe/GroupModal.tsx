"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Group, GroupDetail } from "@/types";
import { formatFullName } from "@/lib/utils";

interface GroupModalProps {
	group: Group;
	onClose: () => void;
}

export default function GroupModal({ group, onClose }: GroupModalProps) {
	const [detail, setDetail] = useState<GroupDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDetail = async () => {
			try {
				const { data } = await api.get<GroupDetail>(
					`/groups/${group.id}`,
				);
				setDetail(data);
			} catch (error) {
				console.error("Failed to load group detail", error);
			} finally {
				setLoading(false);
			}
		};

		loadDetail();
	}, [group.id]);

	const coachName = formatFullName(
		group.coach.firstName,
		group.coach.lastName,
		group.coach.email,
	);

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
			<div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-soft)]">
					<div>
						<h2 className="text-lg font-bold text-[var(--color-ink-800)]">
							{group.name}
						</h2>
						<p className="text-xs text-[var(--color-slate-500)] mt-0.5">
							Antrenor: {coachName}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-[var(--color-slate-500)] hover:text-[var(--color-ink-800)]"
					>
						✕
					</button>
				</div>

				<div className="px-6 py-3 border-b border-[var(--color-border-soft)] text-xs text-[var(--color-slate-500)]">
					{group.athleteCount} sportivi
				</div>

				<div className="overflow-auto flex-1">
					{loading ? (
						<div className="px-6 py-10 text-center text-sm text-[var(--color-slate-500)]">
							Se încarcă...
						</div>
					) : (
						<table className="w-full text-sm">
							<thead className="bg-[var(--color-silver-bg)]">
								<tr>
									{["Sportiv", "Email"].map((h) => (
										<th
											key={h}
											className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{detail?.members.map((m, i) => (
									<tr
										key={m.id}
										className={
											i % 2 === 0
												? "bg-surface"
												: "bg-[var(--color-surface-subtle)]"
										}
									>
										<td className="px-5 py-3 font-semibold text-[var(--color-ink-800)]">
											{formatFullName(m.firstName, m.lastName, m.email)}
										</td>
										<td className="px-5 py-3 text-[var(--color-slate-500)]">
											{m.email}
										</td>
									</tr>
								))}
								{detail?.members.length === 0 && (
									<tr>
										<td
											colSpan={2}
											className="px-5 py-10 text-center text-[var(--color-slate-400)] text-sm"
										>
											Niciun sportiv asociat încă.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
}
