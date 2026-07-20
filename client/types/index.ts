export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "ADMIN" | "MODERATOR" | "COACH" | "ATHLETE";
}

export interface AuthResponse {
	access_token: string;
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

export interface Coach {
	id: string;
	name: string;
	email: string;
	phone: string;
	discipline: "hipism" | "pentatlon";
	spec: string;
}

export interface Group {
	id: string;
	name: string;
	discipline: "hipism" | "pentatlon";
	level: string;
	year: number;
	athletes: number;
	coach_id: string;
}

export interface Athlete {
	id: string;
	name: string;
	email: string;
	age: number;
	gender: string;
	rank: string;
	discipline: "hipism" | "pentatlon";
	group_id: string;
	coach_id: string;
}
