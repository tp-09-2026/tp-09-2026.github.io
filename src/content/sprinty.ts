/**
 * Semester a šprinty. Stav šprintu (plánovaný / prebieha / hotový) sa počíta sám
 * z dátumov, netreba ho prepínať. Zápisnice a retrospektívy sa k šprintu priradia
 * podľa dátumu.
 *
 * Dátumy, cieľ a úlohy šprintov sa pri builde berú z Jiry (pozri jira.ts).
 * Tu píš len to, čo Jira nemá: čitateľný názov, jednoriadkové zhrnutie a výsledky
 * po skončení šprintu. Šprinty, ktoré v Jire ešte nie sú, slúžia ako plán.
 */
import { mergeSprints } from '../lib/jiraMerge';
import { jiraData } from './jiraData';
import { todo, type Milnik, type Semester, type Sprint } from './types';

/**
 * Tímový projekt trvá dva semestre. Dátumy výučby podľa harmonogramu
 * STU 2026/27 (https://www.stuba.sk/11656). Stránka sama ukáže semester,
 * ktorý práve beží; ostatné sa dajú prepnúť.
 */
export const semestre: Semester[] = [
  { nazov: 'Zimný semester 2026/27', kratky: 'Zimný', od: '2026-09-14', do: '2026-12-12' },
  { nazov: 'Letný semester 2026/27', kratky: 'Letný', od: '2027-02-15', do: '2027-05-15' },
];

/**
 * Dôležité termíny predmetu (napr. odovzdanie dokumentácie, prezentácia), ak ich
 * garant určí. Ukážu sa ako značky pod osou semestra; prázdne = nič sa neukáže.
 */
export const milniky: Milnik[] = [];

export const sprintyRucne: Sprint[] = [
  {
    // v Jire „SCRUM Sprint 0“; dátumy a úlohy sa berú odtiaľ
    cislo: 0,
    nazov: 'Rozbeh tímu a projektu',
    od: '2026-10-05',
    do: '2026-10-18',
    ciel: 'Prevziať ECEH od minulého tímu: rozbehnúť vývojové prostredie a prístupy, zmapovať nasadenie a spustiť tímovú stránku.',
    zhrnutie: 'Preberáme ECEH: prostredie, prístupy, nasadenie a táto stránka.',
    ulohy: [{ text: 'Pripraviť tímovú stránku na GitHub Pages', stav: 'rozpracovana' }],
    ulohyPoznamka: todo('ďalšie úlohy doplníme'),
  },
  // plán: dvojtýždňové šprinty od pondelka (stretnutie s PO) do nedele
  { cislo: 1, od: '2026-10-19', do: '2026-11-01' },
  { cislo: 2, od: '2026-11-02', do: '2026-11-15' },
  { cislo: 3, od: '2026-11-16', do: '2026-11-29' },
  { cislo: 4, od: '2026-11-30', do: '2026-12-13' },
];

/** Ručné údaje spojené s Jirou; toto používa celá stránka. */
export const sprinty: Sprint[] = mergeSprints(sprintyRucne, jiraData);
