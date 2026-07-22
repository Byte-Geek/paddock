"use client";

import { useAuthStore } from "@/store/auth.store";
import AthleteProfileView from "@/components/profil/AthleteProfileView";
import CoachProfileView from "@/components/profil/CoachProfileView";
import ModeratorProfileView from "@/components/profil/ModeratorProfileView";

export default function ProfilPage() {
	const user = useAuthStore((s) => s.user);

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-[#0f1729] text-2xl font-bold">Profil</h1>
				<p className="text-[#8896b3] text-sm mt-1">
					Statistici și istoric personal
				</p>
			</div>

			{user?.role === "ATHLETE" && <AthleteProfileView />}
			{user?.role === "COACH" && <CoachProfileView />}
			{user?.role === "ADMIN" && (
				<ModeratorProfileView />
			)}
		</div>
	);
}
