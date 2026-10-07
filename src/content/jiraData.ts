/**
 * Data stiahnuté z Jiry skriptom `npm run jira` (v GitHub Actions pred každým buildom).
 * Súbor jira-data.json sa necommituje; keď chýba, stránka použije len ručné údaje.
 */
import type { JiraData } from '../lib/jira';

const files = import.meta.glob<JiraData>('./jira-data.json', { eager: true, import: 'default' });

export const jiraData: JiraData | null = files['./jira-data.json'] ?? null;
