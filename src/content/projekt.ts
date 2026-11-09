/**
 * Texty o tíme a projekte. Upravuj priamo tu; na stránke sa zmenia samé.
 * Neznáme veci označ ako todo('…'), stránka ich ukáže ako žltý štítok „doplníme".
 */
import { type Ciel, type KapitolaHistorie, type Maybe, type Odkaz } from './types';

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
 * Popis projektu: odseky textu, prvý sa zobrazí väčším písmom.
 * Prázdny zoznam = pod nadpisom „O projekte“ sa nezobrazí nič (ani štítok).
 * todo('…') = žltý štítok „doplníme“.
 */
export const oProjekte: Maybe<string[]> = [];

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

/**
 * Čo chceme tento rok urobiť. Kým je zoznam prázdny, stránka ukáže štítok „doplníme".
 * Máme dve verzie; na stránke je tá, ktorú priradíme do `ciele` na konci súboru.
 * Stav podľa Jiry k 9. 11. 2026; pri zmene ho prepíš ručne.
 *
 * Verzia B: kratšia, každý riadok je názov funkcionality.
 */
export const cieleVerziaB: Ciel[] = [
  {
    funkcionalita: 'Integrácia mlynčekov do backendu ECEH',
    preKoho: 'učitelia',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Integrácia mlynčekov do frontendu ECEH',
    preKoho: 'učitelia',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Generovanie otázok z PDF na pozadí',
    preKoho: 'učitelia',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Náhľad a úprava vygenerovaných otázok pred uložením do predmetu',
    preKoho: 'učitelia',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Stav kontroly vygenerovaných otázok',
    preKoho: 'učitelia a študenti',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Oprávnenie na generovanie pre vybraných používateľov',
    preKoho: 'správcovia ECEH',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Lokálny jazykový model na serveri FIIT',
    preKoho: 'fakulta',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Vymeniteľné mlynčeky A a B',
    preKoho: 'vedenie projektu',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Architektúra ECEH v ArchiMate',
    preKoho: 'vedenie projektu',
    stav: 'rozpracovane',
  },
];

/** Verzia A: podrobnejšia, po funkcionalitách (prvá verzia z 9. 11. 2026). */
export const cieleVerziaA: Ciel[] = [
  {
    funkcionalita: 'Špecifikácia a návrh napojenia mlynčekov na ECEH',
    preKoho: 'vedenie projektu',
    stav: 'hotove',
  },
  {
    funkcionalita: 'Mlynčeky ako samostatné služby v Dockeri s API, frontou úloh a webhookmi',
    preKoho: 'ECEH',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Nahratie dokumentov a generovanie otázok priamo v ECEH s priebežným stavom',
    preKoho: 'učitelia',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Návrh otázok rozdelený do hodín: úprava, výber a uloženie do predmetu',
    preKoho: 'učitelia',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Kontrola vygenerovaných otázok (unreviewed → reviewed) a evidencia ich pôvodu',
    preKoho: 'učitelia',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Oprávnenie „môže generovať“ pri konkrétnom používateľovi',
    preKoho: 'správcovia ECEH',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Learning objekty a tagy: presúvanie LO medzi hodinami a filtrovanie podľa tagov',
    preKoho: 'architekt predmetu',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Opravy importu predmetu a mazania hodín',
    preKoho: 'učitelia',
    stav: 'planovane',
  },
  {
    funkcionalita: 'Nasadenie mlynčekov a lokálneho jazykového modelu na servery fakulty',
    preKoho: 'ECEH',
    stav: 'rozpracovane',
  },
  {
    funkcionalita: 'Architektúra ECEH v ArchiMate (súčasný a cieľový stav)',
    preKoho: 'vedenie projektu',
    stav: 'rozpracovane',
  },
];

/** Ciele zobrazené na stránke. Na prepnutie zmeň na `cieleVerziaA`. */
export const ciele: Ciel[] = cieleVerziaB;

/**
 * Len verejne dostupné odkazy. Jira sem nepatrí: bez prístupu do nášho projektu
 * by vedúci ani garant odkaz neotvorili.
 */
export const kontakt: { email: Maybe<string>; odkazy: Odkaz[] } = {
  email: 'tp-team-9-2627@googlegroups.com',
  odkazy: [{ nazov: 'ECEH', popis: 'eceh.fiit.stuba.sk', url: 'https://eceh.fiit.stuba.sk/' }],
};
