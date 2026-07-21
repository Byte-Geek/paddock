"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { initials } from "@/lib/utils";
import { User } from "@/types";

const roleLabels: Record<string, string> = {
	ADMIN: "Administrator",
	MODERATOR: "Moderator",
	COACH: "Antrenor",
	ATHLETE: "Sportiv",
};

export default function ContPage() {
	const user = useAuthStore((s) => s.user);
	const setAuth = useAuthStore((s) => s.setAuth);
	const token = useAuthStore((s) => s.token);

	const [firstName, setFirstName] = useState(user?.firstName ?? "");
	const [lastName, setLastName] = useState(user?.lastName ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

	const handleSave = async () => {
		setError("");
		setSaving(true);
		try {
			const { data } = await api.patch<User>("/users/me", {
				firstName,
				lastName,
				email,
			});
			if (token) setAuth(token, data);
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (err: unknown) {
			const message =
				(err as { response?: { data?: { message?: string } } })
					?.response?.data?.message ??
				"Nu s-au putut salva modificările.";
			setError(Array.isArray(message) ? message.join(", ") : message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-[#0f1729] text-2xl font-bold">
					Contul meu
				</h1>
				<p className="text-[#8896b3] text-sm mt-1">
					Datele tale de cont
				</p>
			</div>

			<div className="grid grid-cols-[1fr_2fr] gap-5">
				{/* Avatar card */}
				<div className="bg-white rounded-xl border border-[#e8ecf5] p-6 flex flex-col items-center text-center gap-4">
					<div className="w-24 h-24 rounded-full bg-[#4a7adb] text-white flex items-center justify-center text-3xl font-bold">
						{initials(fullName || "?")}
					</div>
					<div>
						<div className="font-bold text-[#0f1729] text-lg">
							{fullName || user?.email}
						</div>
						<div className="text-[#8896b3] text-sm mt-0.5">
							{user?.email}
						</div>
						<span className="inline-block mt-2 bg-[#4a7adb] text-white text-xs px-3 py-1 rounded-full font-medium">
							{user?.role
								? (roleLabels[user.role] ?? user.role)
								: ""}
						</span>
					</div>
					{user?.createdAt && (
						<div className="w-full border-t border-[#e8ecf5] pt-4 flex flex-col gap-2 text-sm text-left">
							<div className="flex justify-between">
								<span className="text-[#8896b3]">
									Cont creat
								</span>
								<span className="font-semibold text-[#0f1729]">
									{new Date(
										user.createdAt,
									).toLocaleDateString("ro-RO")}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Edit card */}
				<div className="bg-white rounded-xl border border-[#e8ecf5]">
					<div className="px-6 py-4 border-b border-[#e8ecf5]">
						<h3 className="font-semibold text-[#0f1729]">
							Date personale
						</h3>
					</div>
					<div className="p-6 grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-[#8896b3]">
								Prenume
							</label>
							<input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="border border-[#e8ecf5] rounded-lg px-3 py-2.5 text-sm text-[#0f1729] focus:outline-none focus:border-[#4a7adb] transition"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-[#8896b3]">
								Nume
							</label>
							<input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className="border border-[#e8ecf5] rounded-lg px-3 py-2.5 text-sm text-[#0f1729] focus:outline-none focus:border-[#4a7adb] transition"
							/>
						</div>
						<div className="col-span-2 flex flex-col gap-1.5">
							<label className="text-xs font-medium text-[#8896b3]">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="border border-[#e8ecf5] rounded-lg px-3 py-2.5 text-sm text-[#0f1729] focus:outline-none focus:border-[#4a7adb] transition"
							/>
						</div>

						{error && (
							<div className="col-span-2 text-xs text-red-500">
								{error}
							</div>
						)}

						<div className="col-span-2 flex justify-end gap-3">
							<button
								onClick={handleSave}
								disabled={saving}
								className="bg-[#4a7adb] hover:bg-[#3a6acb] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
							>
								{saving
									? "Se salvează..."
									: saved
										? "✓ Salvat!"
										: "Salvează modificările"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
