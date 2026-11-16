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

  it('nests subtasks under their parent task', () => {
    const nested: Record<number, RawIssue[]> = {
      7: [
        { key: 'SCRUM-15', fields: { summary: 'Stránka', labels: ['TP-09'], status: { statusCategory: { key: 'indeterminate' } } } },
        { key: 'SCRUM-18', fields: { summary: 'Prieskum', issuetype: { subtask: true }, parent: { key: 'SCRUM-15' }, status: { statusCategory: { key: 'done' } } } },
        { key: 'SCRUM-20', fields: { summary: 'Implementácia', issuetype: { subtask: true }, parent: { key: 'SCRUM-15' } } },
        // the parent is not public (no label), so its subtask must not leak either
        { key: 'SCRUM-7', fields: { summary: 'Interná vec' } },
        { key: 'SCRUM-30', fields: { summary: 'Detail internej veci', issuetype: { subtask: true }, parent: { key: 'SCRUM-7' } } },
      ],
    };
    const [sprint] = normalizeJira(sprints, nested, { podulohy: true, stitok: 'TP-09' }).sprinty;
    expect(sprint?.ulohy).toEqual([
      {
        kluc: 'SCRUM-15',
        text: 'Stránka',
        stav: 'rozpracovana',
        podulohy: [
          { kluc: 'SCRUM-18', text: 'Prieskum', stav: 'hotova' },
          { kluc: 'SCRUM-20', text: 'Implementácia', stav: 'caka' },
        ],
      },
    ]);
  });

  it('leaves subtasks out when they are switched off', () => {
    const [sprint] = normalizeJira(sprints, issues, { podulohy: false }).sprinty;
    expect(sprint?.ulohy.every((u) => u.podulohy === undefined)).toBe(true);
  });
});

describe('normalizeJira after a sprint is closed', () => {
  const done = (at: string) => ({ status: { name: 'Done', statusCategory: { key: 'done' } }, statuscategorychangedate: at });
  const inProgress = { status: { name: 'In Progress', statusCategory: { key: 'indeterminate' } } };
  // sprint 1 was closed on Mon 19. 10. at 12:30; sprint 2 is running
  const sprints: RawSprint[] = [
    { id: 2, name: 'SCRUM Sprint 2', state: 'active', startDate: '2026-10-19T12:44:00.000Z', endDate: '2026-11-02T12:44:00.000Z' },
    { id: 1, name: 'SCRUM Sprint 1', state: 'closed', startDate: '2026-10-05T11:00:00.000Z', endDate: '2026-10-19T11:00:00.000Z', completeDate: '2026-10-19T12:30:00.000Z' },
  ];
  const sprint1: RawIssue[] = [
    // finished a few seconds before the sprint was closed (Jira's own format with +0200)
    { key: 'S-1', fields: { summary: 'Stihnutá', ...done('2026-10-19T14:29:50.000+0200') } },
    // carried over to sprint 2 and finished there
    { key: 'S-2', fields: { summary: 'Frontend', ...done('2026-10-25T10:00:00.000Z') } },
    // carried over to sprint 2, still in progress
    { key: 'S-3', fields: { summary: 'Backend', ...inProgress } },
    // back to the backlog, still in progress
    { key: 'S-4', fields: { summary: 'Špecifikácia', ...inProgress } },
    // cancelled during sprint 1
    { key: 'S-5', fields: { summary: 'Mlynček C', status: { name: 'Zrušené', statusCategory: { key: 'done' } }, statuscategorychangedate: '2026-10-10T10:00:00.000Z' } },
  ];
  const sprint2: RawIssue[] = [sprint1[1]!, sprint1[2]!, { key: 'S-6', fields: { summary: 'Nová', ...inProgress } }];
  const data = normalizeJira(sprints, { 1: sprint1, 2: sprint2 }, { podulohy: false, zrusene: ['zrušené'] });
  const byId = (id: number) => data.sprinty.find((s) => s.id === id)?.ulohy;

  it('keeps the state each task ended the closed sprint with', () => {
    expect(byId(1)).toEqual([
      { kluc: 'S-1', text: 'Stihnutá', stav: 'hotova' },
      { kluc: 'S-2', text: 'Frontend', stav: 'presunuta', presunutaDo: 2 },
      { kluc: 'S-3', text: 'Backend', stav: 'presunuta', presunutaDo: 2 },
      { kluc: 'S-4', text: 'Špecifikácia', stav: 'nesplnena' },
      { kluc: 'S-5', text: 'Mlynček C', stav: 'zrusena' },
    ]);
  });

  it('shows the running sprint as it is now and marks tasks carried over into it', () => {
    expect(byId(2)).toEqual([
      { kluc: 'S-2', text: 'Frontend', stav: 'hotova', zoSprintu: 1 },
      { kluc: 'S-3', text: 'Backend', stav: 'rozpracovana', zoSprintu: 1 },
      { kluc: 'S-6', text: 'Nová', stav: 'rozpracovana' },
    ]);
  });

  it('turns the carried-over sprint ids into sprint numbers', () => {
    const merged = mergeSprints([], data);
    expect(merged.find((s) => s.cislo === 1)?.ulohy?.[1]).toEqual({ text: 'Frontend', stav: 'presunuta', presunutaDo: 2 });
    expect(merged.find((s) => s.cislo === 2)?.ulohy?.[0]).toEqual({ text: 'Frontend', stav: 'hotova', zoSprintu: 1 });
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

  it('keeps subtasks but drops the Jira keys', () => {
    const [s1] = mergeSprints(
      manual,
      data([
        {
          id: 7,
          nazov: 'SCRUM Sprint 1',
          stav: 'active',
          od: '2026-09-28',
          do: '2026-10-11',
          ulohy: [{ kluc: 'SCRUM-1', text: 'Úloha', stav: 'rozpracovana', podulohy: [{ kluc: 'SCRUM-2', text: 'Časť', stav: 'hotova' }] }],
        },
      ]),
    );
    expect(s1?.ulohy).toEqual([{ text: 'Úloha', stav: 'rozpracovana', podulohy: [{ text: 'Časť', stav: 'hotova' }] }]);
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
