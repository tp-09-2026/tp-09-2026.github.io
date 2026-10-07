/**
 * Light/dark theme. The first paint is decided by the small script in index.html
 * (saved choice → #dark/#light in the URL → system setting), so the page never
 * flashes the wrong colours. These helpers keep React in sync afterwards.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme: Theme, remember: boolean): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (!remember) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private mode or blocked storage: the toggle still works for this visit
  }
}

/** "#dark" / "#light" in the URL force a theme (handy for sharing a preview). */
export function themeFromHash(hash: string): Theme | null {
  if (hash === '#dark') return 'dark';
  if (hash === '#light') return 'light';
  return null;
}
