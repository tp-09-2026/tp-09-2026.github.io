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
  /** when the sprint was closed in Jira */
  completeDate?: string;
  goal?: string;
}

/** Issue as returned by GET /rest/agile/1.0/sprint/{id}/issue */
export interface RawIssue {
  key: string;
  fields: {
    summary?: string;
    status?: { name?: string; statusCategory?: { key?: string } };
    /** when the status category last changed, e.g. when the task was finished */
    statuscategorychangedate?: string;
    issuetype?: { subtask?: boolean };
    labels?: string[];
    parent?: { key?: string };
  };
}

export interface JiraPoduloha {
  kluc: string;
  text: string;
  stav: StavUlohy;
}

export interface JiraUloha extends JiraPoduloha {
  podulohy?: JiraPoduloha[];
  /** Jira id of the later sprint the unfinished task was carried over to */
  presunutaDo?: number;
  /** Jira id of the earlier sprint the task was carried over from */
  zoSprintu?: number;
}

export interface JiraOptions {
  podulohy: boolean;
  stitok?: string | null;
  /** status names that mean the task was cancelled */
  zrusene?: readonly string[];
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

/** Current state of a task or subtask in Jira. */
function currentState(issue: RawIssue, cancelled: readonly string[]): StavUlohy {
  const name = issue.fields.status?.name?.trim().toLowerCase();
  if (name && cancelled.some((c) => c.trim().toLowerCase() === name)) return 'zrusena';
  return taskState(issue.fields.status?.statusCategory?.key);
}

/**
 * The state a task ended a closed sprint with. Jira only returns today's state, so a
 * task carried over and finished in a later sprint would look finished in both; it
 * counts for this sprint only if it was finished before the sprint was closed.
 */
function closedSprintState(issue: RawIssue, sprint: RawSprint, carriedOver: boolean, cancelled: readonly string[]): StavUlohy {
  const now = currentState(issue, cancelled);
  const closedAt = sprint.completeDate ?? sprint.endDate;
  const changedAt = issue.fields.statuscategorychangedate;
  const finished = now === 'hotova' || now === 'zrusena';
  if (finished && (!closedAt || !changedAt || Date.parse(changedAt) <= Date.parse(closedAt))) return now;
  if (carriedOver) return 'presunuta';
  return now === 'zrusena' ? 'zrusena' : 'nesplnena';
}

function toTask(issue: RawIssue, stav: StavUlohy): JiraPoduloha {
  return { kluc: issue.key, text: (issue.fields.summary ?? issue.key).trim(), stav };
}

function startTime(sprint: RawSprint): number {
  return sprint.startDate ? Date.parse(sprint.startDate) : Number.POSITIVE_INFINITY;
}

export function normalizeJira(
  sprints: readonly RawSprint[],
  issuesBySprint: Readonly<Record<number, readonly RawIssue[]>>,
  options: JiraOptions,
  now: Date = new Date(),
): JiraData {
  const cancelled = options.zrusene ?? [];
  // A task that is in several sprints was carried over from the earlier one to the later one.
  const chronological = [...sprints].sort((a, b) => startTime(a) - startTime(b) || a.id - b.id);
  const keys = new Map(chronological.map((s) => [s.id, new Set((issuesBySprint[s.id] ?? []).map((i) => i.key))]));
  const sprintWith = (key: string, candidates: readonly RawSprint[]) => candidates.find((c) => keys.get(c.id)?.has(key));

  return {
    aktualizovane: now.toISOString(),
    sprinty: sprints.map((s) => {
      const stav = s.state === 'active' || s.state === 'closed' ? s.state : 'future';
      const all = issuesBySprint[s.id] ?? [];
      const position = chronological.indexOf(s);
      const earlier = chronological.slice(0, position).reverse();
      const later = chronological.slice(position + 1);
      // subtasks are grouped under their parent; they follow the parent's visibility,
      // so a subtask of a task that is not public is never published either
      const subtasksByParent = new Map<string, JiraPoduloha[]>();
      for (const issue of all) {
        const parent = issue.fields.parent?.key;
        if (!issue.fields.issuetype?.subtask || !parent) continue;
        const subtask = toTask(issue, currentState(issue, cancelled));
        subtasksByParent.set(parent, [...(subtasksByParent.get(parent) ?? []), subtask]);
      }
      const ulohy = all
        .filter((issue) => !issue.fields.issuetype?.subtask)
        .filter((issue) => !options.stitok || (issue.fields.labels ?? []).includes(options.stitok))
        .map((issue) => {
          const next = stav === 'closed' ? sprintWith(issue.key, later) : undefined;
          const previous = sprintWith(issue.key, earlier);
          const state = stav === 'closed' ? closedSprintState(issue, s, next !== undefined, cancelled) : currentState(issue, cancelled);
          const uloha: JiraUloha = toTask(issue, state);
          const podulohy = options.podulohy ? subtasksByParent.get(issue.key) : undefined;
          if (podulohy?.length) uloha.podulohy = podulohy;
          if (next && state === 'presunuta') uloha.presunutaDo = next.id;
          if (previous) uloha.zoSprintu = previous.id;
          return uloha;
        });
      const sprint: JiraSprint = { id: s.id, nazov: s.name.trim(), stav, ulohy };
      if (s.startDate) sprint.od = localDay(s.startDate);
      if (s.startDate && s.endDate) sprint.do = lastSprintDay(s.startDate, s.endDate);
      if (s.goal?.trim()) sprint.ciel = s.goal.trim();
      return sprint;
    }),
  };
}
