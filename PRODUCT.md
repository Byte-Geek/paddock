# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Multi-role, roughly equal in importance — no single dominant persona:

- **Athlete** — participates in competitions, tracked within groups.
- **Coach** — manages groups of athletes and their entries across competitions.
- **Event Secretary** — administers events: creating events, categories, assigning referees.
- **Referee (Category Referee)** — scores athletes ringside against protocol elements, identified by letter code/position.
- **Moderator / Admin** — platform-wide oversight.

## Product Purpose

"Paddock" is a competition-management platform for equestrian sport (dressage and show jumping), covering the full lifecycle of a competition: registering athletes/coaches/groups, organizing events and categories, assigning referees, running protocol-based scoring, and publishing results/statistics.

## Positioning

An end-to-end federation platform: rather than a narrow scoring tool or a narrow registration tool, it unifies athlete/coach/group management, event and category administration, referee assignment, configurable scoring protocols (dressage movements and show-jumping errors, multiple scoring algorithms — SUM, AVERAGE, AVERAGE_DROP_HIGH_LOW, WEIGHTED_SUM), and results/statistics in one system for a national/regional federation.

## Operating Context

- Backend: NestJS ("paddock") with PostgreSQL/Prisma.
- Frontend: Next.js ("client"), Romanian-language UI (routes named in Romanian: `antrenori` (coaches), `sportivi` (athletes), `grupe` (groups), `competitii` (competitions), `protocoale` (protocols), `evenimente` (events), `statistici` (stats), `cont`/`profil` (account/profile)).
- Public surfaces: dashboard, events listing, protocols listing, a scoring calculator.
- Protected surfaces (behind auth): coaches, coach detail, competitions, competition detail, groups, athletes, statistics, account, profile.
- Protocol templates define ordered elements (movements for dressage, collective marks, course/technical errors for show jumping) with scoring method, max score, score step, and coefficient; categories bind a protocol template to a discipline within an event.

## Capabilities and Constraints

- Romanian-language only — no i18n/localization requirement.
- Must follow the national equestrian federation's official rules/terminology for scoring and protocols (specific federation not yet named — record as open).
- Roles enforced: ATHLETE, COACH, MODERATOR, ADMIN (plus event-scoped Event Secretary and Category Referee assignments).
- Event lifecycle: DRAFT → PUBLISHED → ONGOING → COMPLETED.
- Participation lifecycle: REGISTERED → COMPETED / DISQUALIFIED / WITHDRAWN.

## Brand Commitments

Existing name: "Paddock" (repo/package name). No other binding brand assets confirmed yet.

## Evidence on Hand

A protocol reference PDF exists at the repo root (`191.pdf`, Russian-tagged PDF metadata) — likely a source protocol/scoring document; treat as evidence only, do not fabricate content from it without checking.

## Product Principles

1. Every role's workflow (athlete, coach, secretary, referee, admin) matters equally — no persona should be deprioritized as secondary.
2. Scoring fidelity to federation rules is non-negotiable — protocol templates, algorithms, and terminology must match official regulations, not generic conventions.
3. Romanian-first: all UI copy, terminology, and routes stay in Romanian; do not introduce English UI strings.
4. The system models the full competition lifecycle (registration → event → scoring → results), not an isolated feature.

## Accessibility & Inclusion

Not yet established — record as open.
