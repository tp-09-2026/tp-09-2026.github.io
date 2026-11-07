import { describe, expect, it } from 'vitest';
import type { Semester, Sprint } from '../content/types';
import {
  calendarCells,
  currentSemester,
  focusSprint,
  groupTasks,
  listPreview,
  sprintsUpTo,
  semesterPosition,
  semesterSegments,
  semesterWeek,
  semesterWeeks,
  sprintDay,
  sprintLength,
  sprintOutcome,
  sprintStatus,
  taskFate,
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

describe('sprintOutcome', () => {
  const ulohy: Sprint['ulohy'] = [
    { text: 'Spustiť stránku', stav: 'hotova' },
    { text: 'Nasadiť backend', stav: 'nesplnena' },
    { text: 'Mlynček C', stav: 'zrusena' },
    { text: 'Návrh frontendu', stav: 'presunuta', presunutaDo: 2 },
    { text: 'Prístupy do Jiry', stav: 'hotova', zoSprintu: 0 },
    { text: 'Testy', stav: 'rozpracovana' },
  ];

  it('splits the tasks into finished, unfinished (carried over first) and cancelled', () => {
    const { splnene, nesplnene, zrusene } = sprintOutcome({ ulohy });
    expect(splnene.map((u) => u.text)).toEqual(['Spustiť stránku', 'Prístupy do Jiry']);
    expect(nesplnene.map((u) => u.text)).toEqual(['Návrh frontendu', 'Nasadiť backend', 'Testy']);
    expect(zrusene.map((u) => u.text)).toEqual(['Mlynček C']);
  });

  it('is empty without tasks', () => {
    expect(sprintOutcome({})).toEqual({ splnene: [], nesplnene: [], zrusene: [] });
  });
});

describe('taskFate', () => {
  it('says where an unfinished task went', () => {
    expect(taskFate({ text: 'x', stav: 'presunuta', presunutaDo: 2 }, true)).toBe('presunutá do šprintu 2');
    expect(taskFate({ text: 'x', stav: 'presunuta' }, true)).toBe('presunutá do ďalšieho šprintu');
    expect(taskFate({ text: 'x', stav: 'nesplnena' }, true)).toBe('nedokončená, vrátená do backlogu');
    expect(taskFate({ text: 'x', stav: 'zrusena' }, false)).toBe('zrušená');
  });

  it('says where a carried-over task came from', () => {
    expect(taskFate({ text: 'x', stav: 'hotova', zoSprintu: 1 }, true)).toBe('presunutá zo šprintu 1');
    expect(taskFate({ text: 'x', stav: 'rozpracovana', zoSprintu: 3 }, false)).toBe('presunutá zo šprintu 3');
    expect(taskFate({ text: 'x', stav: 'presunuta', zoSprintu: 2, presunutaDo: 4 }, true)).toBe(
      'zo šprintu 2, presunutá ďalej do šprintu 4',
    );
  });

  it('calls an open task unfinished only once the sprint is over', () => {
    expect(taskFate({ text: 'x', stav: 'rozpracovana' }, true)).toBe('nedokončená');
    expect(taskFate({ text: 'x', stav: 'rozpracovana' }, false)).toBeUndefined();
    expect(taskFate({ text: 'x', stav: 'hotova' }, true)).toBeUndefined();
  });
});

describe('listPreview', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  it('shows only the first rows of a long list until it is opened', () => {
    expect(listPreview(items, 6, false)).toEqual({ shown: [1, 2, 3, 4, 5, 6], collapsible: true });
    expect(listPreview(items, 6, true)).toEqual({ shown: items, collapsible: true });
  });

  it('shows a list one row over the limit whole, without a button', () => {
    expect(listPreview(items.slice(0, 7), 6, false)).toEqual({ shown: items.slice(0, 7), collapsible: false });
    expect(listPreview([], 6, false)).toEqual({ shown: [], collapsible: false });
  });
});

describe('groupTasks', () => {
  it('groups tasks by state, in progress first and empty groups left out', () => {
    const groups = groupTasks([
      { text: 'a', stav: 'hotova' },
      { text: 'b', stav: 'rozpracovana' },
      { text: 'c', stav: 'hotova' },
    ] as const);
    expect(groups.map((g) => [g.stav, g.ulohy.map((u) => u.text)])).toEqual([
      ['rozpracovana', ['b']],
      ['hotova', ['a', 'c']],
    ]);
  });
});
