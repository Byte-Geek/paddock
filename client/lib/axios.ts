import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function fileUrl(path: string): string {
	return `${API_ORIGIN}${path}`;
}

const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = Cookies.get("access_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			Cookies.remove("access_token", { path: "/" });
			localStorage.removeItem("user");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

export default api;
