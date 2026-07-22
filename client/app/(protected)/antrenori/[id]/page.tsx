"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Coach, Group } from "@/types";
import { initials, formatFullName } from "@/lib/utils";
import LoadingState from "@/components/ui/LoadingState";
import GroupCard from "@/components/grupe/GroupCard";
import GroupModal from "@/components/grupe/GroupModal";

export default function CoachDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();

	const [coach, setCoach] = useState<Coach | null>(null);
	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [openGroup, setOpenGroup] = useState<Group | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const [coachesRes, groupsRes] = await Promise.all([
					api.get<Coach[]>("/coaches"),
					api.get<Group[]>("/groups"),
				]);
				const found = coachesRes.data.find((c) => c.id === params.id);
				if (!found) {
					setError("Antrenorul nu a fost găsit.");
					return;
				}
				setCoach(found);
				setGroups(
					groupsRes.data.filter((g) => g.coach.id === params.id),
				);
			} catch (err) {
				console.error("Failed to load coach detail", err);
				setError("Nu s-a putut încărca antrenorul.");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [params.id]);

	if (loading) {
		return <LoadingState className="text-[#8896b3]" />;
	}
	if (error || !coach) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				{error || "Antrenorul nu a fost găsit."}
			</div>
		);
	}

	const fullName = formatFullName(
		coach.firstName,
		coach.lastName,
		coach.email,
	);

	return (
		<div className="flex flex-col gap-5">
			<button
				onClick={() => router.push("/antrenori")}
				className="text-sm text-[#4a7adb] hover:underline self-start"
			>
				← Înapoi la antrenori
			</button>

			<div className="bg-white rounded-xl border border-[#e8ecf5] p-5 flex items-center gap-4">
				<div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b5d7f1] to-[#e0eef9] text-[#143654] grid place-items-center font-bold text-lg flex-shrink-0">
					{initials(fullName)}
				</div>
				<div className="min-w-0">
					<div className="font-bold text-lg text-[#0f1729] truncate">
						{fullName}
					</div>
					<div className="text-sm text-[#8896b3] truncate">
						{coach.email}
					</div>
				</div>
			</div>

			<h2 className="font-semibold text-[#0f1729]">Grupe</h2>

			{groups.length === 0 ? (
				<div className="rounded-xl border border-[#e8ecf5] bg-white p-6 text-sm text-[#8896b3]">
					Nicio grupă asociată.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4">
					{groups.map((g) => (
						<GroupCard
							key={g.id}
							group={g}
							onDetails={() => setOpenGroup(g)}
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
		</div>
	);
}
