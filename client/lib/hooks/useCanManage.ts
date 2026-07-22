import { useAuthStore } from "@/store/auth.store";

export function useCanManage(): boolean {
	return useAuthStore((s) => s.user?.role === "ADMIN");
}
