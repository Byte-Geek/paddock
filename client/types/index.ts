export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "ADMIN" | "MODERATOR" | "COACH" | "ATHLETE";
	createdAt?: string;
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

export interface GroupCoach {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface Group {
	id: string;
	name: string;
	description: string | null;
	coach: GroupCoach;
	athleteCount: number;
}

export interface GroupMember {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface GroupDetail extends Group {
	members: GroupMember[];
}

export interface Athlete {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	groups: { id: string; name: string }[];
}

export interface Medals {
	gold: number;
	silver: number;
	bronze: number;
	totalParticipations: number;
}

export interface EventsTimelinePoint {
	month: string;
	currentYear: number;
	previousYear: number;
}

export interface TopCoach {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	medals: number;
}

export interface AthletesPerGroup {
	name: string;
	value: number;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED";

export interface EventSecretary {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface CompetitionEvent {
	id: string;
	name: string;
	location: string | null;
	description: string | null;
	startDate: string | null;
	endDate: string | null;
	status: EventStatus;
	participantCount: number;
	secretaries: EventSecretary[];
}

export interface ParticipationEntry {
	id: string;
	athleteId: string;
	athleteName: string;
	horseName: string | null;
	finalScore: string | null;
	rank: number | null;
	status: string;
}

export interface CategoryEntry {
	id: string;
	name: string;
	participations: ParticipationEntry[];
}

export interface CompetitionEventDetail extends CompetitionEvent {
	categories: CategoryEntry[];
}

export type Gender = "M" | "F";

export type ScoringAlgorithm =
	| "SUM"
	| "AVERAGE"
	| "AVERAGE_DROP_HIGH_LOW"
	| "WEIGHTED_SUM";

export interface ProtocolTemplate {
	id: string;
	name: string;
	level: string | null;
	description: string | null;
	compositionYear: number | null;
	revisionYear: number | null;
	estimatedTimeSeconds: number | null;
	scoringAlgorithm: ScoringAlgorithm;
	active: boolean;
	elementCount: number;
	categoryCount: number;
	pdfUrl: string | null;
	pdfFileName: string | null;
}

export interface ProtocolElement {
	id: string;
	order: number;
	number: number | null;
	letters: string | null;
	name: string;
	judgingCriteria: string | null;
	maxScore: string;
	coefficient: string;
}

export interface ProtocolTemplateDetail extends ProtocolTemplate {
	elements: ProtocolElement[];
}

export interface PersonalMedals {
	gold: number;
	silver: number;
	bronze: number;
	total: number;
}

export interface ParticipationHistoryEntry {
	id: string;
	eventName: string;
	categoryName: string;
	eventDate: string | null;
	horseName: string | null;
	finalScore: string | null;
	rank: number | null;
	status: string;
}

export interface AthleteProfileStats {
	medals: PersonalMedals;
	history: ParticipationHistoryEntry[];
}

export interface CoachGroupStats {
	id: string;
	name: string;
	athleteCount: number;
	medals: PersonalMedals;
}

export interface CoachProfileStats {
	ownParticipation: AthleteProfileStats | null;
	groups: CoachGroupStats[];
	overall: {
		totalAthletes: number;
		totalParticipations: number;
		medals: PersonalMedals;
	};
}

export interface ModeratorProfileStats {
	athletes: number;
	coaches: number;
	groups: number;
	events: number;
	note: string;
}

export interface Referee {
	id: string;
	firstName: string;
	lastName: string;
	letterCode: string;
	position: string | null;
}

export interface CategoryParticipation {
	id: string;
	athleteId: string;
	athleteName: string;
	horseName: string | null;
	participationNumber: number;
	finalScore: string | null;
	rank: number | null;
	status: string;
}

export interface CategoryElement {
	id: string;
	order: number;
	number: number | null;
	letters: string | null;
	name: string;
	judgingCriteria: string | null;
	maxScore: string;
	coefficient: string;
}

export interface Category {
	id: string;
	name: string;
	eventId: string;
	eventName: string;
	eventStatus: EventStatus;
	protocolTemplateId: string;
	protocolTemplateName: string;
	refereeCount: number;
	participationCount: number;
}

export interface CategoryDetail extends Category {
	elements: CategoryElement[];
	referees: Referee[];
	participations: CategoryParticipation[];
}

export interface ScoreDetail {
	elementId: string;
	value: string | null;
	correction: string | null;
	remark: string | null;
}

export interface EvaluationDetail {
	id: string;
	participationId: string;
	categoryRefereeId: string;
	finalScore: string | null;
	percentage: string | null;
	finalized: boolean;
	scores: ScoreDetail[];
}
