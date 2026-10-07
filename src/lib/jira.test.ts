import { describe, expect, it } from 'vitest';
import type { Sprint } from '../content/types';
import { lastSprintDay, localDay, normalizeJira, taskState, updatedLabel, type JiraData, type RawIssue, type RawSprint } from './jira';
import { mergeSprints, sprintNumberFromName } from './jiraMerge';

describe('normalizeJira', () => {
  const sprints: RawSprint[] = [
    {
      id: 7,
      name: 'SCRUM Sprint 1',
      state: 'active',
      startDate: '2026-09-28T07:00:00.000Z', // Mon 9:00 in Bratislava
      endDate: '2026-10-12T07:00:00.000Z', // Mon 9:00 two weeks later
      goal: '  Rozbehnúť tím  ',
    },
    { id: 8, name: 'SCRUM Sprint 2', state: 'future' },
  ];
  const issues: Record<number, RawIssue[]> = {
    7: [
      { key: 'SCRUM-1', fields: { summary: 'Tímová stránka', status: { statusCategory: { key: 'indeterminate' } } } },
      { key: 'SCRUM-2', fields: { summary: 'Prístupy', status: { statusCategory: { key: 'done' } } } },
      { key: 'SCRUM-3', fields: { summary: 'Podúloha', issuetype: { subtask: true } } },
    ],
  };

  it('keeps only the public fields and maps states', () => {
    const data = normalizeJira(sprints, issues, { podulohy: false }, new Date('2026-10-07T12:00:00Z'));
    expect(data).toEqual({
      aktualizovane: '2026-10-07T12:00:00.000Z',
      sprinty: [
        {
          id: 7,
          nazov: 'SCRUM Sprint 1',
          stav: 'active',
          od: '2026-09-28',
          do: '2026-10-11',
          ciel: 'Rozbehnúť tím',
          ulohy: [
            { kluc: 'SCRUM-1', text: 'Tímová stránka', stav: 'rozpracovana' },
            { kluc: 'SCRUM-2', text: 'Prístupy', stav: 'hotova' },
          ],
        },
        { id: 8, nazov: 'SCRUM Sprint 2', stav: 'future', ulohy: [] },
      ],
    });
  });

  it('can show only tasks with a label', () => {
    const labelled: Record<number, RawIssue[]> = {
      7: [
        { key: 'SCRUM-7', fields: { summary: 'Interná vec' } },
        { key: 'SCRUM-8', fields: { summary: 'Docker', labels: ['TP-09'] } },
      ],
    };
    const data = normalizeJira(sprints, labelled, { podulohy: false, stitok: 'TP-09' });
    expect(data.sprinty[0]?.ulohy.map((u) => u.kluc)).toEqual(['SCRUM-8']);
  });

  it('can include subtasks', () => {
    const data = normalizeJira(sprints, issues, { podulohy: true });
    expect(data.sprinty[0]?.ulohy).toHaveLength(3);
  });
});

describe('Jira dates', () => {
  it('uses the Bratislava calendar day', () => {
    expect(localDay('2026-10-06T22:30:00.000Z')).toBe('2026-10-07');
  });
  it('treats an end at the start time as "until the day before"', () => {
    expect(lastSprintDay('2026-09-28T07:00:00.000Z', '2026-10-12T07:00:00.000Z')).toBe('2026-10-11');
  });
  it('keeps an end in the evening on that day', () => {
    expect(lastSprintDay('2026-09-28T07:00:00.000Z', '2026-10-09T15:00:00.000Z')).toBe('2026-10-09');
  });
  it('labels the download time in Bratislava time', () => {
    expect(updatedLabel('2026-10-07T12:05:00.000Z')).toBe('7.\u00a010. 14:05');
  });
  it('maps unknown categories to waiting', () => {
    expect(taskState(undefined)).toBe('caka');
  });
});

describe('mergeSprints', () => {
  const manual: Sprint[] = [
    { cislo: 1, nazov: 'Rozbeh tímu a projektu', od: '2026-09-28', do: '2026-10-11', zhrnutie: 'Stránka', vysledky: ['x'] },
    { cislo: 2, od: '2026-10-12', do: '2026-10-25' },
    { cislo: 3, od: '2026-10-26', do: '2026-11-08' },
  ];
  const data = (sprinty: JiraData['sprinty']): JiraData => ({ aktualizovane: '2026-10-07T12:00:00.000Z', sprinty });

  it('returns the manual sprints without Jira data', () => {
    expect(mergeSprints(manual, null)).toEqual(manual);
  });

  it('takes dates, goal and tasks from Jira and keeps the readable name', () => {
    const [s1] = mergeSprints(
      manual,
      data([
        {
          id: 7,
          nazov: 'SCRUM Sprint 1',
          stav: 'active',
          od: '2026-09-29',
          do: '2026-10-12',
          ciel: 'Cieľ z Jiry',
          ulohy: [{ kluc: 'SCRUM-1', text: 'Úloha', stav: 'hotova' }],
        },
      ]),
    );
    expect(s1).toMatchObject({
      cislo: 1,
      nazov: 'Rozbeh tímu a projektu',
      od: '2026-09-29',
      do: '2026-10-12', // Jira wins; the hand-planned sprint 2 moves out of the way instead
      ciel: 'Cieľ z Jiry',
      zhrnutie: 'Stránka',
      vysledky: ['x'],
      ulohy: [{ text: 'Úloha', stav: 'hotova' }],
      ulohyZJiry: true,
    });
  });

  it('moves hand-planned sprints out of the way of real ones', () => {
    const merged = mergeSprints(
      manual,
      data([{ id: 7, nazov: 'SCRUM Sprint 1', stav: 'active', od: '2026-09-28', do: '2026-10-14', ulohy: [] }]),
    );
    expect(merged.map((s) => [s.cislo, s.od, s.do])).toEqual([
      [1, '2026-09-28', '2026-10-14'],
      [2, '2026-10-15', '2026-10-25'],
      [3, '2026-10-26', '2026-11-08'],
    ]);
  });

  it('uses a custom Jira name but hides default ones', () => {
    const merged = mergeSprints(
      [],
      data([
        { id: 1, nazov: 'Analýza požiadaviek 4', stav: 'closed', od: '2026-09-01', do: '2026-09-14', ulohy: [] },
        { id: 2, nazov: 'SCRUM Sprint 5', stav: 'closed', od: '2026-09-15', do: '2026-09-28', ulohy: [] },
      ]),
    );
    expect(merged.map((s) => [s.cislo, s.nazov])).toEqual([
      [4, 'Analýza požiadaviek 4'],
      [5, undefined],
    ]);
  });

  it('skips Jira sprints that have no dates anywhere', () => {
    const merged = mergeSprints([], data([{ id: 9, nazov: 'SCRUM Sprint 9', stav: 'future', ulohy: [] }]));
    expect(merged).toEqual([]);
  });

  it('reads the sprint number from the end of the name', () => {
    expect(sprintNumberFromName('SCRUM Sprint 12')).toBe(12);
    expect(sprintNumberFromName('Kickoff')).toBeUndefined();
  });
});
