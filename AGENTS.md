# Pokyny pre coding agentov (a ľudí)

Tímová stránka tímu **TP-09** (predmet Tímový projekt, FIIT STU, 2026/27). Tím pokračuje vo vývoji
projektu **ECEH** (Educational Content Engineering Hub). Stránku čítajú hlavne **vedúci tímu
a garant predmetu**, aby videli progres: šprinty, zápisnice, dokumenty a kto je v tíme.

Stack: Vite + React + TypeScript, čisté CSS (bez Tailwindu), testy vo Vitest, nasadenie na GitHub Pages
cez GitHub Actions.

## Príkazy

```bash
npm install        # prvýkrát
npm run dev        # lokálne na http://localhost:5173
npm test           # testy (aj kontrola obsahu a názvov PDF)
npm run typecheck  # TypeScript
npm run build      # produkčný build do dist/
npm run check      # všetko naraz – spusti pred každým commitom
npm run jira       # stiahne šprinty a úlohy z Jiry (potrebuje JIRA_EMAIL a JIRA_API_TOKEN)
```

Potrebný je Node.js 22.18 alebo novší (skript `scripts/jira-sync.ts` beží priamo ako TypeScript).

Pre náhľad iného dňa pridaj do URL `?dnes=RRRR-MM-DD` (napr. `http://localhost:5173/?dnes=2026-11-02`).
`#dark` / `#light` na konci URL vynúti tmavý alebo svetlý režim.

## Kde je obsah

**Obsah sa mení len v `src/content/`. Do komponentov netreba siahať.**

| Čo chceš zmeniť | Súbor |
| --- | --- |
| názvy šprintov, zhrnutie, výsledky, oba semestre, dôležité termíny | `src/content/sprinty.ts` |
| dátumy, cieľ a úlohy šprintov | **v Jire** (stiahnu sa samé, pozri nižšie) |
| členovia, roly, vedúci, product owner | `src/content/tim.ts` |
| texty o projekte, história ECEH, ciele na tento rok, kontakt a odkazy | `src/content/projekt.ts` |
| zápisnice, retrospektívy, metodiky, prezentácie, dokumentácia | PDF do `src/content/dokumenty/<kategória>/` |

Ešte neznáme veci zapíš ako `todo('…')`. Stránka ich ukáže ako žltý štítok „doplníme“, nič si nevymýšľaj.

### Pridať dokument (PDF)

1. Ulož PDF do správneho priečinka:
   `src/content/dokumenty/zapisnice/`, `retrospektivy/`, `metodiky/`, `prezentacie/` alebo `dokumentacia/`.
2. Pomenuj ho `RRRR-MM-DD_Názov.pdf`, napr. `2026-10-08_2. stretnutie tímu.pdf`.
   - Názov za podčiarkovníkom sa zobrazí na stránke (medzery a diakritika sú v poriadku).
   - Ak sú v názve pomlčky namiesto medzier (`2026-10-05_git-branching.pdf`), zmenia sa na medzery.
3. Hotovo. Nič iné netreba písať:
   - dokument sa zaradí do kategórie,
   - k šprintu sa priradí podľa dátumu,
   - deň zápisnice sa v kalendári šprintu označí ako stretnutie tímu.

Zlý názov alebo neznámy priečinok zhodí `npm test`, takže sa nenasadí rozbitý odkaz.

### Šprinty a Jira

- Stav šprintu (plánovaný / prebieha / hotový) sa **počíta z dátumov**, neprepína sa ručne.
- **Dátumy, cieľ a úlohy šprintov sa berú z Jiry** (board 1 projektu SCRUM, nastavenie v `src/content/jira.ts`):
  - GitHub Actions ich stiahne pri každom pushi a každé 3 hodiny (`npm run jira` → `src/content/jira-data.json`, necommituje sa).
  - Šprint z Jiry sa spáruje s ručným podľa čísla na konci názvu („SCRUM Sprint 0“ = šprint 0).
  - Na stránku idú **len úlohy so štítkom (label) `TP-09`**. Úloha bez štítku ostane len v Jire
    (napr. interné veci). Nastavuje sa v `src/content/jira.ts` (`stitok`).
  - Stav úlohy podľa kategórie stavu v Jire: To Do → čaká, In Progress → rozpracovaná, Done → hotová.
  - Podúlohy (subtasky) sa ukážu pod svojou úlohou: riadok úlohy sa dá rozkliknúť a vidno v ňom „hotové/všetky“.
    Štítok potrebuje len nadradená úloha; podúlohy úlohy bez štítku sa nezverejnia.
    Vypína sa v `src/content/jira.ts` (`zobrazitPodulohy: false`).
  - Na stránku ide len názov úlohy a jej stav. Mená ľudí ani popisy nie, ale názvy úloh sú verejné, tak ich tak aj píšte.
- **V `src/content/sprinty.ts` (`sprintyRucne`) píš len to, čo Jira nemá:**
  - `nazov` (čitateľný názov, napr. „Rozbeh tímu a projektu“),
  - `zhrnutie` (jedna veta pre kartu hore na stránke),
  - `vysledky` po skončení šprintu.
- Šprinty, ktoré v Jire ešte nie sú, sú plán; ak sa prekrývajú so skutočným šprintom z Jiry, posunú sa.
- Bez prístupu k Jire (lokálne bez tokenu) stránka použije len ručné údaje vrátane `ulohy` a `ciel`.
- Po skončení šprintu nahraj retrospektívu (PDF).
- Na Jiru stránka neodkazuje: bez prístupu do projektu by ju vedúci ani garant neotvorili.
- Lokálne s dátami z Jiry: do súboru `.env.local` (je v `.gitignore`, necommituje sa) daj
  `JIRA_EMAIL=…` a `JIRA_API_TOKEN=…`, spusti `npm run jira` a potom `npm run dev`.
  Premenné nikdy nepomenúvaj s predponou `VITE_`, inak by sa token dostal do stránky.

### Členovia tímu

- Poradie je abecedne podľa priezviska.
- Rola sa dopíše, keď je naisto dohodnutá: `rola: 'Scrum master'` namiesto `todo('rola')`.
  Kým niekto rolu nemá, stránka ukáže pri tíme štítok „roly doplníme“.
- Fotky na stránke zámerne nie sú; každého člena zastupujú obrysové iniciály z mena a priezviska.

## Pravidlá pre texty

- Píš po slovensky, obyčajnými vetami v prvej osobe množného čísla („robíme“, „sme stihli“). Uvádzaj konkrétne fakty.
- Žiadne emoji, slogany, vtipy ani „superschopnosti“.
- Na stránke nesmú byť odkazy na zdrojový kód ani na sociálne siete členov.
- Bežné medzery stačia, jednopísmenové predložky prilepí k ďalšiemu slovu funkcia `typo()`.
- Dátumy sa formátujú v kóde (`formatDay`, `formatRange`) ako „28. 9. – 11. 10.“. V obsahu sú vždy `RRRR-MM-DD`.

## Pravidlá pre kód

- Farby, gradienty a písma sú iba v `src/styles/tokens.css`. Svetlý režim je na `:root`, tmavý na `html.dark`.
- Komponenty sú v `src/components/` a každý má vlastný `.css` súbor.
- Logika bez Reactu je v `src/lib/` a má testy (`*.test.ts`). Novú logiku pridávaj s testom.
- Písma sú pribalené cez `@fontsource` (Inter Tight, IBM Plex Mono), nič sa nenačítava z Google Fonts.
- Nepridávaj knižnice bez dobrého dôvodu.
- Pred commitom vždy `npm run check`.

## Nasadenie

- Každý push na `main` spustí `.github/workflows/deploy.yml`: typecheck, testy, build a publikovanie na GitHub Pages.
- Repozitár `tp-09-2026.github.io` beží na `https://tp-09-2026.github.io/`. Iný názov repozitára beží na `https://tp-09-2026.github.io/<repo>/`; cestu nastaví workflow sám cez `BASE_PATH`.
- Jednorazové nastavenie v repozitári:
  - **Settings → Pages → Source: GitHub Actions**. Repozitár musí byť verejný (free organizácia).
  - **Settings → Secrets and variables → Actions:** `JIRA_EMAIL` (e-mail Atlassian účtu) a `JIRA_API_TOKEN`
    (vytvorí sa na https://id.atlassian.com/manage-profile/security/api-tokens). Token má obmedzenú platnosť;
    keď vyprší, nasadenie zlyhá s hláškou o 401 a treba vložiť nový.
