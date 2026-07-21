export const MONTHS = [
	"ian",
	"feb",
	"mar",
	"apr",
	"mai",
	"iun",
	"iul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

export function initials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function cn(...classes: (string | undefined | false | null)[]): string {
	return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date | null): {
	day: string;
	month: string;
	year: string;
} {
	if (!date) return { day: "—", month: "—", year: "—" };
	const d = new Date(date);
	return {
		day: String(d.getDate()),
		month: MONTHS[d.getMonth()],
		year: String(d.getFullYear()),
	};
}