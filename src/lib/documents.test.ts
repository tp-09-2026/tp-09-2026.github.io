import { describe, expect, it } from 'vitest';
import type { Sprint } from '../content/types';
import { documentSprint, meetingDays, parseDocument, sortDocuments, titleFromFileName } from './documents';

describe('parseDocument', () => {
  it('reads category, date and title from the path', () => {
    expect(parseDocument('./dokumenty/zapisnice/2026-10-08_2. stretnutie tímu.pdf', '/a.pdf')).toEqual({
      kategoria: 'zapisnice',
      datum: '2026-10-08',
      nazov: '2. stretnutie tímu',
      url: '/a.pdf',
      subor: '2026-10-08_2. stretnutie tímu.pdf',
    });
  });

  it('turns dashed file names into readable titles', () => {
    expect(parseDocument('./dokumenty/metodiky/2026-10-05_git-branching-a-commity.pdf', '/b.pdf').nazov).toBe(
      'Git branching a commity',
    );
    expect(titleFromFileName('ponuka_timu')).toBe('Ponuka timu');
  });

  it('rejects unknown folders and missing dates', () => {
    expect(() => parseDocument('./dokumenty/ine/2026-10-05_x.pdf', '/x')).toThrow(/Neznámy priečinok/);
    expect(() => parseDocument('./dokumenty/zapisnice/zapisnica.pdf', '/x')).toThrow(/dátumom/);
    expect(() => parseDocument('./dokumenty/zapisnice/2026-02-30_x.pdf', '/x')).toThrow(/dátumom/);
  });
});

describe('document helpers', () => {
  const a = parseDocument('./dokumenty/zapisnice/2026-10-01_1. stretnutie.pdf', '/1');
  const b = parseDocument('./dokumenty/metodiky/2026-10-05_git.pdf', '/2');
  const c = parseDocument('./dokumenty/zapisnice/2026-10-08_2. stretnutie.pdf', '/3');
  const sprints: Sprint[] = [
    { cislo: 1, od: '2026-09-28', do: '2026-10-04' },
    { cislo: 2, od: '2026-10-05', do: '2026-10-18' },
  ];

  it('sorts newest first', () => {
    expect(sortDocuments([a, b, c]).map((d) => d.datum)).toEqual(['2026-10-08', '2026-10-05', '2026-10-01']);
  });

  it('assigns documents to sprints by date', () => {
    expect(documentSprint(a, sprints)?.cislo).toBe(1);
    expect(documentSprint(b, sprints)?.cislo).toBe(2);
  });

  it('derives meeting days from minutes only', () => {
    expect([...meetingDays([a, b, c])]).toEqual(['2026-10-01', '2026-10-08']);
  });
});
