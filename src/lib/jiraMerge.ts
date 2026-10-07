import type { Sprint, Uloha } from '../content/types';
import { addDays } from './dates';
import type { JiraData, JiraSprint, JiraUloha } from './jira';

/** "SCRUM Sprint 3" → 3 */
export function sprintNumberFromName(name: string): number | undefined {
  const m = /(\d+)\s*$/.exec(name);
  return m ? Number(m[1]) : undefined;
}

/** Jira's default names ("SCRUM Sprint 3") say nothing, so they are not shown as a title. */
function isDefaultName(name: string): boolean {
  return /^\S+\s+sprint\s+\d+$/i.test(name.trim());
}

function overlaps(a: Pick<Sprint, 'od' | 'do'>, b: Pick<Sprint, 'od' | 'do'>): boolean {
  return a.od <= b.do && b.od <= a.do;
}

/**
 * Combines the hand-written sprints from sprinty.ts with the data from Jira.
 *
 * Jira wins for what it knows (dates, goal, tasks); the hand-written entry keeps
 * what Jira does not have (a readable name, the one-line summary, results).
 * Sprints planned only by hand are kept as placeholders, but moved or trimmed so
 * they never overlap a real sprint from Jira.
 */
export function mergeSprints(manual: readonly Sprint[], data: JiraData | null): Sprint[] {
  if (!data || data.sprinty.length === 0) return [...manual];

  const byNumber = new Map(manual.map((s) => [s.cislo, s]));
  const fromJira: Sprint[] = [];
  const ordered = [...data.sprinty].sort((a, b) => (a.od ?? '9999').localeCompare(b.od ?? '9999') || a.id - b.id);
  ordered.forEach((j, index) => {
    const cislo = sprintNumberFromName(j.nazov) ?? index + 1;
    const merged = fromJiraSprint(j, cislo, byNumber.get(cislo));
    if (merged) fromJira.push(merged);
  });

  const result = [...fromJira];
  const jiraNumbers = new Set(fromJira.map((s) => s.cislo));
  for (const placeholder of manual.filter((s) => !jiraNumbers.has(s.cislo))) {
    const s = { ...placeholder };
    for (const real of fromJira) {
      if (!overlaps(s, real)) continue;
      if (real.od <= s.od) s.od = addDays(real.do, 1);
      else s.do = addDays(real.od, -1);
    }
    if (s.od <= s.do) result.push(s);
  }

  result.sort((a, b) => a.od.localeCompare(b.od) || a.cislo - b.cislo);
  // safety net: a sprint always ends the day before the next one starts
  return result.map((s, i) => {
    const next = result[i + 1];
    if (next && s.do >= next.od && addDays(next.od, -1) >= s.od) return { ...s, do: addDays(next.od, -1) };
    return s;
  });
}

/** Jira keys stay out of the page; only the text and state are published. */
function toUloha(u: JiraUloha): Uloha {
  const uloha: Uloha = { text: u.text, stav: u.stav };
  if (u.podulohy) uloha.podulohy = u.podulohy.map((p) => ({ text: p.text, stav: p.stav }));
  return uloha;
}

function fromJiraSprint(j: JiraSprint, cislo: number, manual: Sprint | undefined): Sprint | undefined {
  const od = j.od ?? manual?.od;
  const end = j.do ?? manual?.do;
  if (!od || !end) return undefined; // a future sprint without dates cannot be placed on the timeline
  const hasTasks = j.ulohy.length > 0;
  const sprint: Sprint = {
    ...manual,
    cislo,
    od,
    do: end,
    ulohy: hasTasks ? j.ulohy.map(toUloha) : manual?.ulohy,
    ulohyPoznamka: hasTasks ? undefined : manual?.ulohyPoznamka,
    ulohyZJiry: hasTasks,
  };
  const name = manual?.nazov ?? (isDefaultName(j.nazov) ? undefined : j.nazov);
  if (name) sprint.nazov = name;
  if (j.ciel) sprint.ciel = j.ciel;
  return sprint;
}
