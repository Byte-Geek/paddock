import { create } from "zustand";
import { User } from "@/types";
import Cookies from "js-cookie";

interface AuthState {
	token: string | null;
	user: User | null;
	setAuth: (token: string, user: User) => void;
	logout: () => void;
	initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	token: null,
	user: null,
	setAuth: (token, user) => {
		localStorage.setItem("user", JSON.stringify(user));
		Cookies.set("access_token", token, { expires: 7, path: "/" });
		set({ token, user });
	},
	logout: () => {
		localStorage.removeItem("user");
		Cookies.remove("access_token", { path: "/" });
		set({ token: null, user: null });
	},
	initialize: () => {
		const token = Cookies.get("access_token");
		const userStr = localStorage.getItem("user");
		
		if (localStorage.getItem("access_token")) {
			localStorage.removeItem("access_token");
		}

		if (token && userStr) {
			try {
				const user = JSON.parse(userStr);
				set({ token, user });
			} catch {
				localStorage.removeItem("user");
				Cookies.remove("access_token", { path: "/" });
			}
		} else {
			localStorage.removeItem("user");
			Cookies.remove("access_token", { path: "/" });
		}
	},
}));
