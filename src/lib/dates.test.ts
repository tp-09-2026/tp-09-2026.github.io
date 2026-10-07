import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatDay, formatRange, isISODate, isWeekend, parseDate, weekday } from './dates';

describe('dates', () => {
  it('parses valid dates and rejects broken ones', () => {
    expect(parseDate('2026-10-07').toISOString()).toBe('2026-10-07T00:00:00.000Z');
    expect(() => parseDate('2026-02-30')).toThrow(/neexistuje/);
    expect(() => parseDate('7. 10. 2026')).toThrow(/RRRR-MM-DD/);
    expect(isISODate('2026-13-01')).toBe(false);
  });

  it('does day arithmetic across month ends', () => {
    expect(addDays('2026-09-28', 13)).toBe('2026-10-11');
    expect(daysBetween('2026-09-28', '2026-10-07')).toBe(9);
    expect(daysBetween('2026-10-07', '2026-09-28')).toBe(-9);
  });

  it('knows the real 2026 weekdays (Monday = 0)', () => {
    expect(weekday('2026-09-28')).toBe(0); // pondelok
    expect(weekday('2026-10-07')).toBe(2); // streda
    expect(isWeekend('2026-10-10')).toBe(true);
    expect(isWeekend('2026-10-09')).toBe(false);
  });

  it('formats Slovak dates with no-break spaces', () => {
    expect(formatDay('2026-09-28')).toBe('28. 9.');
    expect(formatDay('2026-10-07', true)).toBe('7. 10. 2026');
    expect(formatRange('2026-09-28', '2026-10-11')).toBe('28. 9. – 11. 10.');
  });
});
