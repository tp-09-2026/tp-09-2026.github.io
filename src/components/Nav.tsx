import { useEffect, useState } from 'react';
import { tim } from '../content/projekt';
import { applyTheme, currentTheme, themeFromHash, type Theme } from '../lib/theme';
import { EcehMark, Icon, cx } from './ui';
import './Nav.css';

export const SEKCIE = [
  { id: 'projekt', nazov: 'O projekte' },
  { id: 'progres', nazov: 'Progres' },
  { id: 'dokumenty', nazov: 'Dokumenty' },
  { id: 'tim', nazov: 'Tím' },
  { id: 'kontakt', nazov: 'Kontakt' },
] as const;

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  // frosted bar once the page is scrolled
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // highlight the section that crosses the middle of the screen
  useEffect(() => {
    const sections = SEKCIE.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // "#dark" / "#light" typed into the URL switch the theme without reloading
  useEffect(() => {
    const onHash = () => {
      const forced = themeFromHash(window.location.hash);
      if (forced) {
        applyTheme(forced, false);
        setTheme(forced);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    setTheme(next);
  };

  return (
    <header className={cx('nav', solid && 'solid')}>
      <div className="wrap nav-in">
        <a className="brand" href="#top">
          <EcehMark />
          <span>{tim.kod}</span>
          <span className="brand-s">· {tim.projekt}</span>
        </a>
        <nav className="links" aria-label="Sekcie stránky">
          {SEKCIE.map((s) => (
            <a key={s.id} className="u" href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
              {s.nazov}
            </a>
          ))}
        </nav>
        <button
          className="theme"
          type="button"
          onClick={toggle}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Svetlý režim' : 'Tmavý režim'}
        >
          <Icon name="moon" className="moon" />
          <Icon name="sun" className="sun" />
        </button>
      </div>
    </header>
  );
}
