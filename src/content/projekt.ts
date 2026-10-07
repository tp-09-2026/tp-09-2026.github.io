/**
 * Texty o tíme a projekte. Upravuj priamo tu; na stránke sa zmenia samé.
 * Neznáme veci označ ako todo('…'), stránka ich ukáže ako žltý štítok „doplníme".
 */
import { todo, type Ciel, type KapitolaHistorie, type Maybe, type Odkaz } from './types';

export const tim = {
  kod: 'TP-09',
  cislo: '09',
  rok: '2026/27',
  predmet: 'Tímový projekt',
  fakulta: 'FIIT STU',
  projekt: 'ECEH',
};

export const uvod =
  'Sme siedmi študenti z FIIT STU. V školskom roku 2026/27 v rámci predmetu Tímový projekt pokračujeme vo vývoji ECEH, webovej aplikácie pre učiteľov a študentov. Sem priebežne dávame, na čom práve robíme, zápisnice zo stretnutí a ostatné dokumenty.';

/**
 * Popis projektu. Kým ho nenapíšeme podľa dokumentácie od product ownera, stránka
 * ukáže len štítok. Potom sem daj odseky textu, prvý sa zobrazí väčším písmom.
 */
export const oProjekte: Maybe<string[]> = todo('popis projektu doplníme');

/** Kto na ECEH robil pred nami. Zdroj: dokumentácia a repozitáre projektu. */
export const historia: KapitolaHistorie[] = [
  { rok: '2019/20', nazov: 'Databanka', kto: 'Gregor Benčať' },
  { rok: '2020/21', nazov: 'Tím 06' },
  { rok: '2021/22', nazov: 'Tím 04' },
  { rok: '2024/25', nazov: 'Tím 03', kto: 'Nevedelsom Studios' },
  { rok: '2025/26', nazov: 'Tím 15' },
  { rok: '2026/27', nazov: 'Tím 09', my: true },
];

/** true = pri histórii sa ukáže štítok „overiť" */
export const historiaOverit = false;

/** Čo chceme tento rok urobiť. Kým je zoznam prázdny, stránka ukáže štítok „doplníme". */
export const ciele: Ciel[] = [];

/**
 * Len verejne dostupné odkazy. Jira sem nepatrí: bez prístupu do nášho projektu
 * by vedúci ani garant odkaz neotvorili.
 */
export const kontakt: { email: Maybe<string>; odkazy: Odkaz[] } = {
  email: 'tp-team-9-2627@googlegroups.com',
  odkazy: [{ nazov: 'ECEH', popis: 'eceh.fiit.stuba.sk', url: 'https://eceh.fiit.stuba.sk/' }],
};
