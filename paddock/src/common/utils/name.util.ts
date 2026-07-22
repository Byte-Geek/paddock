export function formatFullName(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    fallback: string
): string {
    return `${firstName ?? ''} ${lastName ?? ''}`.trim() || fallback
}
