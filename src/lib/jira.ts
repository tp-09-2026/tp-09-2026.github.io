/**
 * Converts raw Jira Agile API responses into the small, public subset the site
 * needs: sprint name, dates, goal and the tasks with their state. Nothing else
 * (assignees, descriptions, comments) is ever stored or published.
 *
 * This module has no runtime imports on purpose: scripts/jira-sync.ts runs it
 * directly in Node.js, which cannot resolve extensionless imports.
 */
import type { ISODate, StavUlohy } from '../content/types';

/** Sprint as returned by GET /rest/agile/1.0/board/{id}/sprint */
export interface RawSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
}

/** Issue as returned by GET /rest/agile/1.0/sprint/{id}/issue */
export interface RawIssue {
  key: string;
  fields: {
    summary?: string;
    status?: { statusCategory?: { key?: string } };
    issuetype?: { subtask?: boolean };
    labels?: string[];
  };
}

export interface JiraUloha {
  kluc: string;
  text: string;
  stav: StavUlohy;
}

export interface JiraSprint {
  id: number;
  nazov: string;
  stav: 'future' | 'active' | 'closed';
  od?: ISODate;
  do?: ISODate;
  ciel?: string;
  ulohy: JiraUloha[];
}

export interface JiraData {
  /** when the data was downloaded (ISO date-time) */
  aktualizovane: string;
  sprinty: JiraSprint[];
}

const ZONE = 'Europe/Bratislava';
const DAY_MS = 86_400_000;

/** Jira status category → task state on the page */
export function taskState(categoryKey: string | undefined): StavUlohy {
  if (categoryKey === 'done') return 'hotova';
  if (categoryKey === 'indeterminate') return 'rozpracovana';
  return 'caka';
}

/** Calendar day in Bratislava for a Jira date-time. */
export function localDay(dateTime: string): ISODate {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: ZONE }).format(new Date(dateTime));
}

function minutesOfDay(dateTime: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(dateTime));
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

/** "7. 10. 14:05" in Bratislava time, for the "from Jira" note on the page. */
export function updatedLabel(dateTime: string): string {
  const [, month, day] = localDay(dateTime).split('-').map(Number);
  const minutes = minutesOfDay(dateTime);
  const time = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  return `${day}.\u00a0${month}. ${time}`;
}

function shiftDay(day: ISODate, days: number): ISODate {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Last day of a sprint. Jira sets the end to the same time of day as the start
 * (Mon 9:00 → Mon 9:00 two weeks later), so such a sprint really ends the day
 * before; otherwise the end day itself is the last day.
 */
export function lastSprintDay(startDate: string, endDate: string): ISODate {
  const sameTimeOfDay = Math.abs(minutesOfDay(endDate) - minutesOfDay(startDate)) <= 60;
  const lastDay = localDay(endDate);
  return sameTimeOfDay && lastDay > localDay(startDate) ? shiftDay(lastDay, -1) : lastDay;
}

export function normalizeJira(
  sprints: readonly RawSprint[],
  issuesBySprint: Readonly<Record<number, readonly RawIssue[]>>,
  options: { podulohy: boolean; stitok?: string | null },
  now: Date = new Date(),
): JiraData {
  return {
    aktualizovane: now.toISOString(),
    sprinty: sprints.map((s) => {
      const stav = s.state === 'active' || s.state === 'closed' ? s.state : 'future';
      const ulohy = (issuesBySprint[s.id] ?? [])
        .filter((issue) => options.podulohy || !issue.fields.issuetype?.subtask)
        .filter((issue) => !options.stitok || (issue.fields.labels ?? []).includes(options.stitok))
        .map((issue) => ({
          kluc: issue.key,
          text: (issue.fields.summary ?? issue.key).trim(),
          stav: taskState(issue.fields.status?.statusCategory?.key),
        }));
      const sprint: JiraSprint = { id: s.id, nazov: s.name.trim(), stav, ulohy };
      if (s.startDate) sprint.od = localDay(s.startDate);
      if (s.startDate && s.endDate) sprint.do = lastSprintDay(s.startDate, s.endDate);
      if (s.goal?.trim()) sprint.ciel = s.goal.trim();
      return sprint;
    }),
  };
}
