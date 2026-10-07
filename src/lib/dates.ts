/** A calendar date written as "RRRR-MM-DD" (e.g. "2026-10-07"). */
export type ISODate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;
const NBSP = ' ';

/**
 * Parses "RRRR-MM-DD" into a Date at UTC midnight. Working in UTC keeps day
 * arithmetic exact (no daylight-saving shifts). Throws on malformed or
 * non-existent dates such as "2026-02-30", so typos in content files fail loudly.
 */
export function parseDate(iso: ISODate): Date {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new Error(`Neplatný dátum "${iso}", očakávam formát RRRR-MM-DD.`);
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Dátum "${iso}" neexistuje.`);
  }
  return date;
}

export function isISODate(value: string): boolean {
  try {
    parseDate(value);
    return true;
  } catch {
    return false;
  }
}

export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(new Date(parseDate(iso).getTime() + days * DAY_MS));
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / DAY_MS);
}

/** Day of week with Monday = 0 … Sunday = 6 (Slovak calendars start on Monday). */
export function weekday(iso: ISODate): number {
  return (parseDate(iso).getUTCDay() + 6) % 7;
}

export function isWeekend(iso: ISODate): boolean {
  return weekday(iso) >= 5;
}

export function dayOfMonth(iso: ISODate): number {
  return parseDate(iso).getUTCDate();
}

/** "29. 9." or "29. 9. 2026"; the parts are joined by no-break spaces so a date never wraps. */
export function formatDay(iso: ISODate, withYear = false): string {
  const d = parseDate(iso);
  const dayMonth = `${d.getUTCDate()}.${NBSP}${d.getUTCMonth() + 1}.`;
  return withYear ? `${dayMonth}${NBSP}${d.getUTCFullYear()}` : dayMonth;
}

/** "29. 9. – 12. 10." with a spaced en dash, as Slovak typography expects. */
export function formatRange(from: ISODate, to: ISODate, withYear = false): string {
  return `${formatDay(from)}${NBSP}– ${formatDay(to, withYear)}`;
}
