export function getErrorMessage(err: unknown, fallback: string): string {
	const message =
		(err as { response?: { data?: { message?: string | string[] } } })
			?.response?.data?.message ?? fallback;
	return Array.isArray(message) ? message.join(", ") : message;
}
