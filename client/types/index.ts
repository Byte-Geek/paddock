export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "ADMIN" | "MODERATOR" | "COACH" | "ATHLETE";
}

export interface HomeSummary {
	athletes: number;
	coaches: number;
	groups: number;
	championshipsThisYear: number;
	modificationsLastMonth: {
		athletes: number;
		coaches: number;
		groups: number;
	};
}

export interface UpcomingEvent {
	id: string;
	title: string;
	location: string | null;
	startDate: string;
}

export interface Coach {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	groups: { id: string; name: string }[];
}
