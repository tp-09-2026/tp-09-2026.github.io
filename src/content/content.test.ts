/**
 * Guards for the content files. They run in CI before every deploy, so a typo in
 * a date, overlapping sprints or a badly named PDF stops the deploy instead of
 * breaking the live page.
 */
import { describe, expect, it } from 'vitest';
import { isISODate } from '../lib/dates';
import { dokumenty } from './dokumenty';
import { historia, kontakt } from './projekt';
import { milniky, semestre, sprinty } from './sprinty';
import { clenovia } from './tim';
import { isTodo } from './types';

describe('sprinty.ts', () => {
  it('has valid, ordered semesters', () => {
    semestre.forEach((s, i) => {
      expect(isISODate(s.od) && isISODate(s.do), s.nazov).toBe(true);
      expect(s.od < s.do, s.nazov).toBe(true);
      const prev = semestre[i - 1];
      if (prev) expect(prev.do < s.od, `${prev.nazov} a ${s.nazov} sa prekrývajú`).toBe(true);
    });
  });

  it('has valid, ordered, non-overlapping sprints with unique numbers', () => {
    const numbers = new Set<number>();
    sprinty.forEach((s, i) => {
      expect(isISODate(s.od), `šprint ${s.cislo}: od`).toBe(true);
      expect(isISODate(s.do), `šprint ${s.cislo}: do`).toBe(true);
      expect(s.od <= s.do, `šprint ${s.cislo} končí pred začiatkom`).toBe(true);
      expect(numbers.has(s.cislo), `šprint ${s.cislo} je dvakrát`).toBe(false);
      numbers.add(s.cislo);
      const prev = sprinty[i - 1];
      if (prev) expect(prev.do < s.od, `šprinty ${prev.cislo} a ${s.cislo} sa prekrývajú`).toBe(true);
    });
  });

  it('has valid milestone dates', () => {
    milniky.forEach((m) => expect(isISODate(m.datum), m.nazov).toBe(true));
  });

  it('only links to http(s) URLs', () => {
    sprinty.forEach((s) => {
      if (s.jira && !isTodo(s.jira)) expect(s.jira).toMatch(/^https?:\/\//);
    });
  });
});

describe('tim.ts', () => {
  it('lists members with first name and surname', () => {
    expect(clenovia.length).toBeGreaterThan(0);
    clenovia.forEach((c) => {
      // initials on the page come from the first two words of the name
      expect(c.meno.trim().split(/\s+/).length, c.meno).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('projekt.ts', () => {
  it('marks exactly one history entry as us', () => {
    expect(historia.filter((h) => h.my)).toHaveLength(1);
  });

  it('has a valid e-mail and only https links', () => {
    if (!isTodo(kontakt.email)) expect(kontakt.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
    kontakt.odkazy.forEach((o) => {
      if (!isTodo(o.url)) expect(o.url, o.nazov).toMatch(/^https:\/\//);
    });
  });
});

describe('dokumenty', () => {
  it('loads every PDF without errors (bad file names throw)', () => {
    dokumenty.forEach((d) => {
      expect(isISODate(d.datum)).toBe(true);
      expect(d.nazov).not.toBe('');
    });
  });
});
