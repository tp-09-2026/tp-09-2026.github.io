import type { ISODate } from '../lib/dates';

export type { ISODate };

/**
 * Something we do not know yet. The page shows it as a small amber "doplníme"
 * badge, so missing information is visible instead of silently invented.
 * Example: `rola: todo('rola')`.
 */
export interface Todo {
  readonly todo: string;
}

export const todo = (text = 'doplníme'): Todo => ({ todo: text });

export function isTodo(value: unknown): value is Todo {
  return typeof value === 'object' && value !== null && 'todo' in value;
}

/** Either a real value or a `todo(...)` placeholder. */
export type Maybe<T> = T | Todo;

export interface Semester {
  nazov: string;
  /** short label for the switch, e.g. "Zimný" */
  kratky: string;
  /** first day of teaching */
  od: ISODate;
  /** last day of teaching */
  do: ISODate;
  /** true = dates are a guess and show a "dátumy overiť" badge */
  overit?: boolean;
}

export interface Milnik {
  datum: ISODate;
  nazov: string;
}

export type StavUlohy = 'hotova' | 'rozpracovana' | 'caka';

export interface Poduloha {
  text: string;
  stav: StavUlohy;
}

export interface Uloha {
  text: string;
  stav: StavUlohy;
  /** subtasks from Jira, shown when the task is opened on the page */
  podulohy?: Poduloha[];
}

export interface Sprint {
  cislo: number;
  /** short name, e.g. "Rozbeh tímu a projektu" */
  nazov?: string;
  od: ISODate;
  do: ISODate;
  /** sprint goal agreed at sprint planning */
  ciel?: Maybe<string>;
  /** one line for the card at the top of the page; falls back to the goal */
  zhrnutie?: string;
  ulohy?: Uloha[];
  /** shown with a "doplníme" badge under the task list, e.g. todo('ďalšie úlohy doplníme') */
  ulohyPoznamka?: Todo;
  /** set automatically when the tasks come from Jira (do not write by hand) */
  ulohyZJiry?: boolean;
  /** what we actually delivered; fill in after the sprint */
  vysledky?: string[];
  /** link to the sprint (board or report) in Jira */
  jira?: Maybe<string>;
}

export interface Clen {
  meno: string;
  /** until roles are assigned: todo('rola') shows "rola" and a "roly doplníme" badge */
  rola: Maybe<string>;
}

export interface Osoba {
  /** how the role is labelled on the page, e.g. "Vedúci tímu" */
  funkcia: string;
  meno: Maybe<string>;
  overit?: boolean;
}

export interface KapitolaHistorie {
  rok: string;
  nazov: string;
  kto?: string;
  /** our own team, highlighted */
  my?: boolean;
  poznamka?: string;
}

export interface Ciel {
  funkcionalita: string;
  preKoho: string;
  stav: 'planovane' | 'rozpracovane' | 'hotove';
}

export interface Odkaz {
  nazov: string;
  popis: string;
  url: Maybe<string>;
}
