"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Panel from "@/components/ui/Panel";
import api from "@/lib/axios";
import { formatFullName, initials, MONTHS } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type {
  CompetitionEvent,
  CompetitionEventDetail,
  HomeSummary,
  Medals,
  TopCoach,
  UpcomingEvent,
} from "@/types";

const currentYear = new Date().getFullYear();

const statIcons = {
  athletes: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6" />
      <path d="M15 14.3c2.6.4 4.6 2.4 5 5.7" />
    </svg>
  ),
  coaches: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  ),
  groups: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5" />
    </svg>
  ),
  championships: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14.5-1.8 6L12 18l5.3 2.5-1.8-6" />
    </svg>
  ),
};

export default function HomeOverview() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName;

  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [medals, setMedals] = useState<Medals | null>(null);
  const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
  const [liveEvent, setLiveEvent] = useState<CompetitionEventDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [summaryRes, eventsRes, medalsRes, coachesRes, allEventsRes] =
          await Promise.all([
            api.get<HomeSummary>("/home/summary"),
            api.get<UpcomingEvent[]>("/home/upcoming-events"),
            api.get<Medals>("/stats/medals"),
            api.get<TopCoach[]>("/stats/top-coaches"),
            api.get<CompetitionEvent[]>("/events"),
          ]);
        setSummary(summaryRes.data);
        setEvents(eventsRes.data);
        setMedals(medalsRes.data);
        setTopCoaches(coachesRes.data);

        const ongoing = allEventsRes.data.find((e) => e.status === "ONGOING");
        if (ongoing) {
          const { data } = await api.get<CompetitionEventDetail>(
            `/events/${ongoing.id}`,
          );
          setLiveEvent(data);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  if (loading) {
    return <LoadingState className="text-slate-500" />;
  }

  const stats = [
    {
      key: "athletes",
      label: "Sportivi activi",
      value: summary?.athletes ?? 0,
      delta: `+${summary?.modificationsLastMonth.athletes ?? 0} luna asta`,
    },
    {
      key: "coaches",
      label: "Antrenori",
      value: summary?.coaches ?? 0,
      delta: `+${summary?.modificationsLastMonth.coaches ?? 0} luna asta`,
    },
    {
      key: "groups",
      label: "Grupe",
      value: summary?.groups ?? 0,
      delta: `+${summary?.modificationsLastMonth.groups ?? 0} luna asta`,
    },
    {
      key: "championships",
      label: `Campionate / ${currentYear}`,
      value: summary?.championshipsThisYear ?? 0,
      delta: null,
    },
  ] as const;

  const evaluatedCategories =
    liveEvent?.categories.filter(
      (c) =>
        c.participations.length > 0 &&
        c.participations.every((p) => p.status === "COMPLETED"),
    ).length ?? 0;
  const totalCategories = liveEvent?.categories.length ?? 0;
  const progressPct =
    totalCategories > 0
      ? Math.round((evaluatedCategories / totalCategories) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="pb-6 border-b border-border-soft motion-safe:animate-[fade-in_0.4s_ease-out]">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
          Prezentare generală
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-ink-800 tracking-[-0.02em]">
          Bună, {firstName || "acolo"}
        </h1>
        <p className="text-[14px] text-slate-500 mt-2 max-w-[54ch] leading-relaxed">
          Platforma digitală a Școlii Sportive Republicane de Hipism și
          Pentatlon Modern din Chișinău — sportivi, grupe, competiții și
          rezultate, la un loc.
        </p>
      </div>

      {liveEvent && (
        <Panel className="border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="warning" className="animate-pulse">
                  ● ÎN DESFĂȘURARE
                </Badge>
              </div>
              <div className="font-bold text-[18px] text-ink-800 truncate">
                {liveEvent.name}
              </div>
              <div className="text-[12.5px] text-slate-500 mt-1">
                {[liveEvent.location, `${totalCategories} categorii`]
                  .filter(Boolean)
                  .join(" · ")}
              </div>

              {totalCategories > 0 && (
                <div className="mt-3 max-w-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Progres scoring</span>
                    <span className="font-mono font-bold text-ink-800">
                      {evaluatedCategories} / {totalCategories} · {progressPct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/evenimente"
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded-lg px-4 py-2.5 text-[13px] transition-colors duration-200 text-center"
            >
              Afișaj rezultate live
            </Link>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const isLast = i === stats.length - 1;
          return (
            <div
              key={s.key}
              className={
                isLast
                  ? "rounded-lg p-4 bg-blue-600 text-white shadow-[var(--shadow-panel)]"
                  : "rounded-lg p-4 bg-surface border border-border shadow-[var(--shadow-panel)] transition-shadow duration-300 hover:shadow-[var(--shadow-panel-hover)]"
              }
            >
              <div
                className={
                  isLast
                    ? "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-100"
                    : "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600"
                }
              >
                <span className={isLast ? "text-blue-100" : "text-blue-600"}>
                  {statIcons[s.key]}
                </span>
                {s.label}
              </div>
              <div
                className={
                  isLast
                    ? "font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5"
                    : "font-mono text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums mt-2.5 text-ink-800"
                }
              >
                {s.value}
              </div>
              {s.delta && (
                <div
                  className={
                    isLast
                      ? "text-[11px] font-semibold text-blue-100 mt-2"
                      : "text-[11px] font-semibold text-blue-600 mt-2"
                  }
                >
                  {s.delta}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 items-start">
        <Panel
          title="Evenimente apropiate"
          subtitle={`${events.length} programate`}
          action={
            <Link
              href="/evenimente"
              className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Calendar →
            </Link>
          }
          noBodyPadding
        >
          {events.length === 0 ? (
            <div className="p-5">
              <EmptyState>Nu sunt evenimente programate.</EmptyState>
            </div>
          ) : (
            events.map((e, i) => {
              const startDate = new Date(e.startDate);
              const day = startDate.getDate();
              const month = MONTHS[startDate.getMonth()];
              return (
                <div
                  key={e.id}
                  className={`group flex gap-3.5 items-center px-5 py-3.5 ${i > 0 ? "border-t border-border-soft" : ""} hover:bg-surface-subtle transition-colors duration-200`}
                >
                  <div className="w-11 text-center flex-shrink-0 border border-blue-100 bg-blue-50 rounded-md py-1.5 transition-colors duration-200 group-hover:border-blue-300">
                    <div className="text-[9px] font-bold text-blue-800 tracking-[0.06em] uppercase">
                      {month}
                    </div>
                    <div className="font-mono text-[17px] font-bold text-ink-900 leading-none tabular-nums">
                      {day}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[13px] text-ink-800 truncate">
                      {e.title}
                    </div>
                    {e.location && (
                      <div className="text-[11.5px] text-slate-500 mt-0.5 truncate">
                        {e.location}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Medalii — total">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-md bg-gold-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
                <div className="font-mono text-[21px] font-bold text-gold tabular-nums">
                  {medals?.gold ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Aur</div>
              </div>
              <div className="rounded-md bg-silver-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
                <div className="font-mono text-[21px] font-bold text-silver tabular-nums">
                  {medals?.silver ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Argint</div>
              </div>
              <div className="rounded-md bg-bronze-bg py-3 transition-transform duration-200 hover:-translate-y-0.5">
                <div className="font-mono text-[21px] font-bold text-bronze tabular-nums">
                  {medals?.bronze ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Bronz</div>
              </div>
            </div>
          </Panel>

          <Panel title="Antrenori — medalii de aur" noBodyPadding>
            {topCoaches.length === 0 ? (
              <div className="px-5 py-6 text-[12.5px] text-slate-500">
                Nicio medalie de aur înregistrată încă.
              </div>
            ) : (
              topCoaches.map((c, i) => {
                const name = formatFullName(c.firstName, c.lastName, c.email);
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2.5 px-5 py-2.5 transition-colors duration-200 hover:bg-surface-subtle ${i > 0 ? "border-t border-border-soft" : ""}`}
                  >
                    <div className="w-6 text-center text-[11px] font-bold text-slate-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="w-7 h-7 rounded-[7px] bg-blue-50 text-blue-800 grid place-items-center font-bold text-[10.5px] flex-shrink-0">
                      {initials(name)}
                    </div>
                    <div className="min-w-0 flex-1 text-[12.5px] font-semibold text-ink-800 truncate">
                      {name}
                    </div>
                    <div className="text-[11px] font-bold text-gold flex-shrink-0">
                      {c.medals} aur
                    </div>
                  </div>
                );
              })
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
