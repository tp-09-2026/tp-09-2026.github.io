/**
 * Napojenie na Jiru. Prihlasovacie údaje (JIRA_EMAIL, JIRA_API_TOKEN) sú len
 * v GitHub Secrets, nikdy nie v kóde ani na stránke.
 *
 * Tento súbor nesmie nič importovať: číta ho aj skript scripts/jira-sync.ts,
 * ktorý beží priamo v Node.js.
 */
export const jiraNastavenie = {
  /** adresa vašej Jiry */
  url: 'https://stuba-team-bxgehtkq.atlassian.net',
  /** číslo boardu z URL …/boards/1 */
  board: 1,
  /** podúlohy (subtasks) sa zobrazia po rozkliknutí svojej úlohy; false = vôbec */
  zobrazitPodulohy: true,
  /**
   * Na verejnú stránku idú len úlohy s týmto štítkom (label) v Jire. Úloha bez neho
   * ostane len v Jire. null = zobraziť všetky úlohy šprintu.
   */
  stitok: 'TP-09' as string | null,
};
