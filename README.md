# TP-09 · ECEH

Tímová stránka tímu **TP-09** z predmetu Tímový projekt na FIIT STU (2026/27). Pracujeme na projekte
**ECEH** a na stránke ukazujeme náš progres: šprinty, zápisnice, dokumenty a kto je v tíme.

## Spustenie

Potrebuješ Node.js 22.18 alebo novší.

```bash
npm install
npm run dev
```

Stránka beží na http://localhost:5173.

## Úprava obsahu

Všetok obsah je v priečinku `src/content/`:

- **šprinty:** dátumy, cieľ a úlohy sa sťahujú z Jiry, názov a výsledky sú v `sprinty.ts`
- **tím:** `tim.ts`
- **texty a odkazy:** `projekt.ts`
- **PDF dokumenty:** priečinok `dokumenty/`

Napríklad zápisnicu pridáš tak, že PDF uložíš do `src/content/dokumenty/zapisnice/`
s názvom `RRRR-MM-DD_Názov.pdf`. Stránka ju zobrazí sama.

Podrobný návod (aj pre coding agentov) je v [AGENTS.md](AGENTS.md).

## Nasadenie

Push na `main` stránku otestuje, zostaví a zverejní na GitHub Pages (`.github/workflows/deploy.yml`).
Pred pushom spusti `npm run check`.
