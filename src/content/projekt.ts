/**
 * Texty o tíme a projekte. Upravuj priamo tu; na stránke sa zmenia samé.
 * Neznáme veci označ ako todo('…'), stránka ich ukáže ako žltý štítok „doplníme".
 */
import type { Ciel, KapitolaHistorie, Maybe, Odkaz } from './types';

export const tim = {
  kod: 'TP-09',
  cislo: '09',
  rok: '2026/27',
  predmet: 'Tímový projekt',
  fakulta: 'FIIT STU',
  projekt: 'ECEH',
};

export const uvod =
  'Sme siedmi študenti z FIIT STU. V rámci predmetu Tímový projekt pokračujeme vo vývoji ECEH, webovej aplikácie pre učiteľov a študentov. Sem priebežne dávame, na čom práve robíme, zápisnice zo stretnutí a ostatné dokumenty.';

export const oProjekte = [
  'ECEH, pôvodne Databanka, je webová aplikácia, v ktorej učitelia vytvárajú aktivity, lekcie, úlohy a testy a študenti ich riešia. Vznikla v roku 2019 a odvtedy ju po kúskoch rozširujú ďalšie tímy z predmetu Tímový projekt.',
  'Ide o to, aby začínajúci učitelia mali odkiaľ brať dobré materiály a aby učiteľ včas videl, ktorí študenti potrebujú pomoc a ktorí by zvládli viac. My nadväzujeme na tím 15 z minulého roka.',
];

/** Kto na ECEH robil pred nami. Zdroj: dokumentácia a repozitáre projektu. */
export const historia: KapitolaHistorie[] = [
  { rok: '2019/20', nazov: 'Databanka', kto: 'Gregor Benčať' },
  { rok: '2020/21', nazov: 'Tím 06' },
  { rok: '2021/22', nazov: 'Tím 04' },
  { rok: '2024/25', nazov: 'Tím 03', kto: 'Nevedelsom Studios' },
  { rok: '2025/26', nazov: 'Tím 15' },
  {
    rok: '2026/27',
    nazov: 'Tím 09',
    my: true,
    poznamka: 'Teraz sme na rade my. Čo presne pribudne, doplníme po plánovaní s product ownerom.',
  },
];

/** true = pri histórii sa ukáže štítok „overiť" */
export const historiaOverit = false;

/** Veta pod nadpisom histórie: zoznam obsahuje len tímy z predmetu, nie záverečné práce. */
export const historiaPoznamka =
  'Uvádzame tímy z predmetu Tímový projekt. Okrem nich na ECEH pracovali aj viaceré bakalárske a diplomové práce.';

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
