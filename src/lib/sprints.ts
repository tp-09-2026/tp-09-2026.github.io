import type { Semester, Sprint } from '../content/types';
import { addDays, daysBetween, dayOfMonth, isWeekend, weekday, type ISODate } from './dates';

export type SprintStatus = 'hotovy' | 'prebieha' | 'planovany';

/** ISO dates compare correctly as strings, so no Date objects are needed here. */
export function sprintStatus(sprint: Pick<Sprint, 'od' | 'do'>, dnes: ISODate): SprintStatus {
  if (dnes < sprint.od) return 'planovany';
  if (dnes > sprint.do) return 'hotovy';
  return 'prebieha';
}

export function sprintLength(sprint: Pick<Sprint, 'od' | 'do'>): number {
  return daysBetween(sprint.od, sprint.do) + 1;
}

/** 1-based day of the sprint, clamped to 0 … length (0 = not started yet). */
export function sprintDay(sprint: Pick<Sprint, 'od' | 'do'>, dnes: ISODate): number {
  const length = sprintLength(sprint);
  return Math.min(length, Math.max(0, daysBetween(sprint.od, dnes) + 1));
}

/**
 * The sprint the page should talk about right now:
 * - "prebieha": a sprint is running today
 * - "pred": before the first sprint (shows the first one)
 * - "medzi": between two sprints (shows the next one)
 * - "po": all sprints are over (shows the last one)
 */
export type Focus =
  | { kind: 'prebieha'; sprint: Sprint }
  | { kind: 'pred'; sprint: Sprint }
  | { kind: 'medzi'; sprint: Sprint }
  | { kind: 'po'; sprint: Sprint }
  | { kind: 'ziadny' };

export function focusSprint(sprints: readonly Sprint[], dnes: ISODate): Focus {
  const sorted = [...sprints].sort((a, b) => (a.od < b.od ? -1 : 1));
  const running = sorted.find((s) => sprintStatus(s, dnes) === 'prebieha');
  if (running) return { kind: 'prebieha', sprint: running };
  const next = sorted.find((s) => s.od > dnes);
  const last = sorted[sorted.length - 1];
  if (next) return next === sorted[0] ? { kind: 'pred', sprint: next } : { kind: 'medzi', sprint: next };
  if (last) return { kind: 'po', sprint: last };
  return { kind: 'ziadny' };
}

/** Sprints the panel can browse: everything up to and including `last`, oldest first. */
export function sprintsUpTo(sprints: readonly Sprint[], last: Sprint): Sprint[] {
  return [...sprints].filter((s) => s.od <= last.od).sort((a, b) => a.od.localeCompare(b.od));
}

export function sprintForDate(sprints: readonly Sprint[], date: ISODate): Sprint | undefined {
  return sprints.find((s) => s.od <= date && date <= s.do);
}

export interface CalendarCell {
  iso: ISODate;
  day: number;
  inSprint: boolean;
  past: boolean;
  today: boolean;
  weekend: boolean;
  meeting: boolean;
}

/** Monday-to-Sunday weeks covering the whole sprint, ready for a 7-column grid. */
export function calendarCells(
  sprint: Pick<Sprint, 'od' | 'do'>,
  dnes: ISODate,
  meetings: ReadonlySet<ISODate> = new Set(),
): CalendarCell[] {
  const first = addDays(sprint.od, -weekday(sprint.od));
  const last = addDays(sprint.do, 6 - weekday(sprint.do));
  const cells: CalendarCell[] = [];
  for (let iso = first; iso <= last; iso = addDays(iso, 1)) {
    cells.push({
      iso,
      day: dayOfMonth(iso),
      inSprint: sprint.od <= iso && iso <= sprint.do,
      past: iso < dnes,
      today: iso === dnes,
      weekend: isWeekend(iso),
      meeting: meetings.has(iso),
    });
  }
  return cells;
}

export interface SemesterSegment {
  kind: 'sprint' | 'gap';
  sprint?: Sprint;
  od: ISODate;
  do: ISODate;
  days: number;
}

/** Splits the semester into sprint blocks and the gaps between them (for the ruler). */
export function semesterSegments(semester: Semester, sprints: readonly Sprint[]): SemesterSegment[] {
  const inside = [...sprints]
    .filter((s) => s.do >= semester.od && s.od <= semester.do)
    .sort((a, b) => (a.od < b.od ? -1 : 1));
  const segments: SemesterSegment[] = [];
  let cursor = semester.od;
  for (const s of inside) {
    const od = s.od < semester.od ? semester.od : s.od;
    const end = s.do > semester.do ? semester.do : s.do;
    if (od > cursor) segments.push(gap(cursor, addDays(od, -1)));
    segments.push({ kind: 'sprint', sprint: s, od, do: end, days: daysBetween(od, end) + 1 });
    cursor = addDays(end, 1);
  }
  if (cursor <= semester.do) segments.push(gap(cursor, semester.do));
  return segments;
}

function gap(od: ISODate, end: ISODate): SemesterSegment {
  return { kind: 'gap', od, do: end, days: daysBetween(od, end) + 1 };
}

/**
 * The semester shown first: the latest one that has already started (so the
 * winter semester stays visible during the exam period), or the first one
 * before anything has started.
 */
export function currentSemester(semestre: readonly Semester[], dnes: ISODate): Semester | undefined {
  const sorted = [...semestre].sort((a, b) => a.od.localeCompare(b.od));
  return sorted.filter((s) => s.od <= dnes).pop() ?? sorted[0];
}

export function semesterDays(semester: Semester): number {
  return daysBetween(semester.od, semester.do) + 1;
}

export function semesterWeeks(semester: Semester): number {
  return Math.ceil(semesterDays(semester) / 7);
}

/** Current teaching week (1-based), or null outside the semester. */
export function semesterWeek(semester: Semester, dnes: ISODate): number | null {
  if (dnes < semester.od || dnes > semester.do) return null;
  return Math.floor(daysBetween(semester.od, dnes) / 7) + 1;
}

/** Position of a date on the semester ruler as a fraction 0 … 1 (middle of the day). */
export function semesterPosition(semester: Semester, date: ISODate): number {
  const fraction = (daysBetween(semester.od, date) + 0.5) / semesterDays(semester);
  return Math.min(1, Math.max(0, fraction));
}

/** "Šprint 01" style two-digit number. */
export function sprintNumber(cislo: number): string {
  return String(cislo).padStart(2, '0');
}
