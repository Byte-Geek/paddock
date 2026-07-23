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

export function formatFullName(
	firstName: string | null | undefined,
	lastName: string | null | undefined,
	fallback: string,
): string {
	return `${firstName ?? ""} ${lastName ?? ""}`.trim() || fallback;
}

export function formatPercentage(value: number): string {
	let str = value.toFixed(4);
	str = str.replace(/0+$/, "");
	if (str.endsWith(".")) {
		str += "0";
	}
	return str;
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