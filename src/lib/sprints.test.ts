import { describe, expect, it } from 'vitest';
import type { Semester, Sprint } from '../content/types';
import {
  calendarCells,
  currentSemester,
  focusSprint,
  sprintsUpTo,
  semesterPosition,
  semesterSegments,
  semesterWeek,
  semesterWeeks,
  sprintDay,
  sprintLength,
  sprintStatus,
} from './sprints';

const s1: Sprint = { cislo: 1, od: '2026-09-28', do: '2026-10-11' };
const s2: Sprint = { cislo: 2, od: '2026-10-12', do: '2026-10-25' };
const s4: Sprint = { cislo: 4, od: '2026-11-09', do: '2026-11-22' };
const semester: Semester = { nazov: 'ZS', kratky: 'Zimný', od: '2026-09-21', do: '2026-12-20' };
const leto: Semester = { nazov: 'LS', kratky: 'Letný', od: '2027-02-15', do: '2027-05-15' };

describe('sprint status', () => {
  it('follows the dates', () => {
    expect(sprintStatus(s1, '2026-09-27')).toBe('planovany');
    expect(sprintStatus(s1, '2026-09-28')).toBe('prebieha');
    expect(sprintStatus(s1, '2026-10-11')).toBe('prebieha');
    expect(sprintStatus(s1, '2026-10-12')).toBe('hotovy');
  });

  it('counts sprint days', () => {
    expect(sprintLength(s1)).toBe(14);
    expect(sprintDay(s1, '2026-10-07')).toBe(10);
    expect(sprintDay(s1, '2026-09-01')).toBe(0);
    expect(sprintDay(s1, '2026-12-01')).toBe(14);
  });
});

describe('focusSprint', () => {
  const all = [s2, s1, s4];
  it('picks the running sprint', () => {
    expect(focusSprint(all, '2026-10-07')).toEqual({ kind: 'prebieha', sprint: s1 });
  });
  it('picks the first sprint before the start', () => {
    expect(focusSprint(all, '2026-09-01')).toEqual({ kind: 'pred', sprint: s1 });
  });
  it('picks the next sprint in a gap', () => {
    expect(focusSprint(all, '2026-11-01')).toEqual({ kind: 'medzi', sprint: s4 });
  });
  it('picks the last sprint at the end', () => {
    expect(focusSprint(all, '2027-01-15')).toEqual({ kind: 'po', sprint: s4 });
  });
  it('handles no sprints', () => {
    expect(focusSprint([], '2026-10-07')).toEqual({ kind: 'ziadny' });
  });
});

describe('calendarCells', () => {
  it('lays a Monday-start sprint out in two full weeks', () => {
    const cells = calendarCells(s1, '2026-10-07', new Set(['2026-10-01']));
    expect(cells).toHaveLength(14);
    expect(cells[0]).toMatchObject({ iso: '2026-09-28', day: 28, inSprint: true, past: true });
    expect(cells.find((c) => c.today)?.iso).toBe('2026-10-07');
    expect(cells.find((c) => c.meeting)?.iso).toBe('2026-10-01');
    expect(cells.filter((c) => c.weekend).map((c) => c.day)).toEqual([3, 4, 10, 11]);
  });

  it('pads sprints that do not start on Monday', () => {
    const cells = calendarCells({ od: '2026-09-30', do: '2026-10-13' }, '2026-10-01');
    expect(cells).toHaveLength(21);
    expect(cells[0]).toMatchObject({ iso: '2026-09-28', inSprint: false });
  });
});

describe('semester', () => {
  it('splits the semester into gaps and sprints', () => {
    const segs = semesterSegments(semester, [s2, s1]);
    expect(segs.map((s) => [s.kind, s.days])).toEqual([
      ['gap', 7],
      ['sprint', 14],
      ['sprint', 14],
      ['gap', 56],
    ]);
    expect(segs.reduce((sum, s) => sum + s.days, 0)).toBe(91);
  });

  it('knows the week and position of a date', () => {
    expect(semesterWeeks(semester)).toBe(13);
    expect(semesterWeek(semester, '2026-10-07')).toBe(3);
    expect(semesterWeek(semester, '2026-09-01')).toBeNull();
    expect(semesterPosition(semester, '2026-09-21')).toBeCloseTo(0.5 / 91);
    expect(semesterPosition(semester, '2027-01-01')).toBe(1);
  });
});

describe('currentSemester', () => {
  it('shows the running semester', () => {
    expect(currentSemester([leto, semester], '2026-10-07')).toBe(semester);
    expect(currentSemester([leto, semester], '2027-03-01')).toBe(leto);
  });
  it('keeps the winter semester during the exam period', () => {
    expect(currentSemester([semester, leto], '2027-01-20')).toBe(semester);
  });
  it('shows the first semester before the start', () => {
    expect(currentSemester([semester, leto], '2026-09-01')).toBe(semester);
  });
});

describe('sprintsUpTo', () => {
  it('lists earlier sprints oldest first and stops at the given one', () => {
    expect(sprintsUpTo([s4, s2, s1], s2)).toEqual([s1, s2]);
    expect(sprintsUpTo([s4, s2, s1], s1)).toEqual([s1]);
  });
});
