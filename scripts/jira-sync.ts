/**
 * Downloads the sprints of our board and their tasks from Jira and saves the public
 * subset to src/content/jira-data.json, which the site is built from.
 *
 * Runs in GitHub Actions before the tests and the build (`npm run jira`). Needs
 * JIRA_EMAIL and JIRA_API_TOKEN in the environment; without them it does nothing
 * and the site uses only the hand-written data from src/content/sprinty.ts.
 *
 * Locally the credentials can live in .env.local (gitignored), see AGENTS.md.
 */
import { writeFile } from 'node:fs/promises';
import { jiraNastavenie } from '../src/content/jira.ts';
import { normalizeJira, type RawIssue, type RawSprint } from '../src/lib/jira.ts';

const OUTPUT = new URL('../src/content/jira-data.json', import.meta.url);

// Local credentials from .env.local; variables already set in the environment win.
try {
  process.loadEnvFile(new URL('../.env.local', import.meta.url));
} catch {
  // no .env.local: fine, CI passes the credentials as environment variables
}

const PAGE = 50;

const email = process.env.JIRA_EMAIL?.trim();
const token = process.env.JIRA_API_TOKEN?.trim();

if (!email || !token) {
  console.log('Jira: JIRA_EMAIL alebo JIRA_API_TOKEN nie je nastavený, stránka použije len ručné údaje.');
  process.exit(0);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${jiraNastavenie.url}${path}`, {
    headers: { Authorization: auth, Accept: 'application/json' },
  });
  if (!response.ok) {
    const hint = response.status === 401 ? ' (zlý e-mail alebo token, prípadne token vypršal)' : '';
    throw new Error(`Jira odpovedala ${response.status} ${response.statusText}${hint}: ${path}`);
  }
  return (await response.json()) as T;
}

async function sprints(): Promise<RawSprint[]> {
  const all: RawSprint[] = [];
  for (let startAt = 0; ; startAt += PAGE) {
    const page = await get<{ values: RawSprint[]; isLast?: boolean }>(
      `/rest/agile/1.0/board/${jiraNastavenie.board}/sprint?startAt=${startAt}&maxResults=${PAGE}`,
    );
    all.push(...page.values);
    if (page.isLast !== false || page.values.length === 0) return all;
  }
}

async function issues(sprintId: number): Promise<RawIssue[]> {
  const all: RawIssue[] = [];
  for (let startAt = 0; ; startAt += PAGE) {
    const page = await get<{ issues: RawIssue[]; total: number }>(
      `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&maxResults=${PAGE}&fields=summary,status,issuetype,labels`,
    );
    all.push(...page.issues);
    if (all.length >= page.total || page.issues.length === 0) return all;
  }
}

const rawSprints = await sprints();
const issuesBySprint: Record<number, RawIssue[]> = {};
for (const sprint of rawSprints) issuesBySprint[sprint.id] = await issues(sprint.id);

const data = normalizeJira(rawSprints, issuesBySprint, {
  podulohy: jiraNastavenie.zobrazitPodulohy,
  stitok: jiraNastavenie.stitok,
});
await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`);

const taskCount = data.sprinty.reduce((sum, s) => sum + s.ulohy.length, 0);
console.log(`Jira: ${data.sprinty.length} šprintov a ${taskCount} úloh uložených do src/content/jira-data.json.`);
