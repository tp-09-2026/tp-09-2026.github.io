import { describe, expect, it } from 'vitest';
import { backSheetPath, frontSheetPath } from './sheet';
import { today } from './today';
import { typo } from './typography';

describe('typo', () => {
  it('glues one-letter words to the next word', () => {
    expect(typo('Sme z FIIT a v rámci predmetu')).toBe('Sme z FIIT a v rámci predmetu');
    expect(typo('V roku 2019')).toBe('V roku 2019');
  });
  it('leaves other words alone', () => {
    expect(typo('ECEH je aplikácia')).toBe('ECEH je aplikácia');
  });
});

describe('today', () => {
  it('uses the Bratislava calendar day', () => {
    expect(today('', new Date('2026-10-06T22:30:00Z'))).toBe('2026-10-07');
  });
  it('accepts a ?dnes= override and ignores invalid ones', () => {
    expect(today('?dnes=2026-11-02', new Date('2026-10-07T10:00:00Z'))).toBe('2026-11-02');
    expect(today('?dnes=zajtra', new Date('2026-10-07T10:00:00Z'))).toBe('2026-10-07');
  });
});

describe('sheet paths', () => {
  it('draws a closed outline with a diagonal cut', () => {
    const d = frontSheetPath(300, 200, 16, 26);
    expect(d.startsWith('M0.75 0.75')).toBe(true);
    expect(d).toContain('L0.75 173.25');
    expect(d.endsWith('Z')).toBe(true);
  });
  it('shifts back sheets right and down', () => {
    expect(backSheetPath(300, 200, 16, 14)).toContain('M0.75 14.75H297.25');
  });
});
