import { EventStatus } from "@/types";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
	DRAFT: "Ciornă",
	PUBLISHED: "Publicată",
	ONGOING: "În desfășurare",
	COMPLETED: "Finalizată",
};

export const EVENT_STATUS_VARIANTS: Record<
	EventStatus,
	"gray" | "warning" | "success" | "danger" | "blue"
> = {
	DRAFT: "gray",
	PUBLISHED: "blue",
	ONGOING: "warning",
	COMPLETED: "success",
};

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = (
	Object.keys(EVENT_STATUS_LABELS) as EventStatus[]
).map((value) => ({ value, label: EVENT_STATUS_LABELS[value] }));
