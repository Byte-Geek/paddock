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
