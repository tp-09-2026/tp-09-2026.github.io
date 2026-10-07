import type { Sprint } from '../content/types';
import { isISODate, type ISODate } from './dates';
import { sprintForDate } from './sprints';

/** Folder name in src/content/dokumenty → how the category is labelled on the page. */
export const KATEGORIE = [
  { id: 'zapisnice', jednotne: 'Zápisnica', mnozne: 'Zápisnice', ikona: 'file' },
  { id: 'retrospektivy', jednotne: 'Retrospektíva', mnozne: 'Retrospektívy', ikona: 'kanban' },
  { id: 'metodiky', jednotne: 'Metodika', mnozne: 'Metodiky', ikona: 'book' },
  { id: 'prezentacie', jednotne: 'Prezentácia', mnozne: 'Prezentácie', ikona: 'pres' },
  { id: 'dokumentacia', jednotne: 'Dokumentácia', mnozne: 'Dokumentácia', ikona: 'file' },
] as const;

export type Kategoria = (typeof KATEGORIE)[number];
export type KategoriaId = Kategoria['id'];

export interface Dokument {
  kategoria: KategoriaId;
  datum: ISODate;
  nazov: string;
  url: string;
  /** original file name, for error messages and keys */
  subor: string;
}

const PATH = /\/dokumenty\/([^/]+)\/([^/]+)\.pdf$/i;
const FILE = /^(\d{4}-\d{2}-\d{2})_(.+)$/;

/**
 * Turns one PDF found under src/content/dokumenty into a document entry.
 *
 * File names must look like "RRRR-MM-DD_nazov.pdf":
 * - "2026-10-08_2. stretnutie tímu.pdf"   → title "2. stretnutie tímu" (spaces and diacritics are kept)
 * - "2026-10-05_git-branching-a-commity.pdf" → title "Git branching a commity" (dashes become spaces)
 *
 * Anything else throws, which makes `npm test` (and therefore the deploy) fail
 * instead of publishing a broken entry.
 */
export function parseDocument(path: string, url: string): Dokument {
  const m = PATH.exec(path);
  if (!m) throw new Error(`Súbor "${path}" nie je PDF v priečinku src/content/dokumenty/<kategória>/.`);
  const folder = m[1] ?? '';
  const file = m[2] ?? '';
  const kategoria = KATEGORIE.find((k) => k.id === folder);
  if (!kategoria) {
    const allowed = KATEGORIE.map((k) => k.id).join(', ');
    throw new Error(`Neznámy priečinok "${folder}" pre "${file}.pdf". Povolené sú: ${allowed}.`);
  }
  const f = FILE.exec(file);
  if (!f || !isISODate(f[1] ?? '')) {
    throw new Error(`Názov "${file}.pdf" musí začínať platným dátumom, napr. "2026-10-08_2. stretnutie tímu.pdf".`);
  }
  return { kategoria: kategoria.id, datum: f[1] ?? '', nazov: titleFromFileName(f[2] ?? ''), url, subor: `${file}.pdf` };
}

export function titleFromFileName(raw: string): string {
  const name = raw.trim();
  if (/\s/.test(name)) return name;
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Newest first; documents from the same day are sorted by title. */
export function sortDocuments(docs: readonly Dokument[]): Dokument[] {
  return [...docs].sort((a, b) => (a.datum !== b.datum ? (a.datum < b.datum ? 1 : -1) : a.nazov.localeCompare(b.nazov, 'sk')));
}

export function kategoria(id: KategoriaId): Kategoria {
  const k = KATEGORIE.find((x) => x.id === id);
  if (!k) throw new Error(`Neznáma kategória ${id}`);
  return k;
}

/** The sprint a document belongs to, decided by its date. */
export function documentSprint(doc: Dokument, sprints: readonly Sprint[]): Sprint | undefined {
  return sprintForDate(sprints, doc.datum);
}

/** Days with minutes ("zápisnica") are the days the team met. */
export function meetingDays(docs: readonly Dokument[]): Set<ISODate> {
  return new Set(docs.filter((d) => d.kategoria === 'zapisnice').map((d) => d.datum));
}
