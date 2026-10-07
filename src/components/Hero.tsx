import { useEffect, useRef, type CSSProperties } from 'react';
import { tim, uvod } from '../content/projekt';
import { sprinty } from '../content/sprinty';
import { clenovia, vedenie } from '../content/tim';
import { isTodo, type Sprint } from '../content/types';
import { formatDay, formatRange, type ISODate } from '../lib/dates';
import { focusSprint, sprintDay, sprintLength, sprintNumber, type Focus } from '../lib/sprints';
import { typo } from '../lib/typography';
import { Icon, Value, studentov } from './ui';
import './Hero.css';

export function Hero({ dnes }: { dnes: ISODate }) {
  const focus = focusSprint(sprinty, dnes);
  return (
    <section className="hero" id="top">
      <div className="mesh" aria-hidden="true">
        <i className="m1" />
        <i className="m2" />
        <i className="m3" />
        <i className="m4" />
        <i className="m5" />
        <b className="veil" />
      </div>
      <div className="wrap hero-in">
        <div>
          <p className="kicker">
            {tim.predmet} · {tim.fakulta} · {tim.rok}
          </p>
          <h1>
            <span className="h1a">
              Tím <b>{tim.cislo}</b> na projekte
            </span>
            <span className="sr"> {tim.projekt}</span>
            <EcehWord />
          </h1>
          <p className="intro">{typo(uvod)}</p>
          <div className="ctas">
            <a className="btn" href="#progres">
              Pozrieť progres
              <Icon name="down" />
            </a>
            <a className="lnk u" href="#tim">
              Kto sme
            </a>
          </div>
        </div>
        {focus.kind !== 'ziadny' && <SprintStack focus={focus} dnes={dnes} />}
      </div>
      <div className="wrap">
        <dl className="facts">
          <div>
            <dt>Predmet</dt>
            <dd>
              {tim.predmet}, {tim.fakulta}
            </dd>
          </div>
          <div>
            <dt>Projekt</dt>
            <dd>{tim.projekt}</dd>
          </div>
          <div>
            <dt>{vedenie.veduci.funkcia}</dt>
            <dd>
              <Value value={vedenie.veduci.meno} />
            </dd>
          </div>
          <div>
            <dt>Členovia</dt>
            <dd>{studentov(clenovia.length)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/**
 * The giant outlined "ECEH". The letters are an SVG text outline; on hover a
 * gradient clipped to the same letters slides up and fills them.
 */
function EcehWord() {
  const ref = useRef<SVGSVGElement>(null);

  // Fit the viewBox to the real width of the word once the web font is loaded,
  // so the word always spans the column edge to edge.
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const fit = () => {
      const text = svg.querySelector<SVGTextElement>('.e-out');
      if (!text) return;
      try {
        const box = text.getBBox();
        if (box.width) svg.setAttribute('viewBox', `7 0 ${Math.ceil(box.x + box.width) - 5} 158`);
      } catch {
        // getBBox can throw while the SVG is not rendered; the default viewBox is fine
      }
    };
    void document.fonts.ready.then(fit);
  }, []);

  return (
    <svg ref={ref} className="eceh" viewBox="7 0 500 158" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="eClip">
          <text className="et" x="0" y="152">
            ECEH
          </text>
        </clipPath>
        <linearGradient id="eB" x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--eb1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--eb2)' }} />
        </linearGradient>
        <radialGradient id="eT">
          <stop offset="0" stopColor="#43cfd8" />
          <stop offset="1" stopColor="#43cfd8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eG">
          <stop offset="0" stopColor="#7cd359" />
          <stop offset="1" stopColor="#7cd359" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eL">
          <stop offset="0" style={{ stopColor: 'var(--el)' }} />
          <stop offset="1" style={{ stopColor: 'var(--el)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <g clipPath="url(#eClip)">
        <g className="e-rise">
          <rect x="-10" y="-150" width="540" height="330" fill="url(#eB)" />
          <ellipse cx="70" cy="10" rx="230" ry="150" fill="url(#eT)" />
          <ellipse cx="470" cy="0" rx="210" ry="140" fill="url(#eG)" />
          <ellipse cx="500" cy="170" rx="180" ry="110" fill="url(#eL)" />
        </g>
      </g>
      <text className="et e-out" x="0" y="152">
        ECEH
      </text>
    </svg>
  );
}

const SHEET_OPACITY = [0.84, 0.68, 0.54, 0.42, 0.32];

/**
 * The ECEH logo turned into a 3D stack: the top sheet is the sprint the team is
 * in now (or the next one), the sheets below are the sprints that follow.
 * Hovering the stack spreads the sheets apart.
 */
function SprintStack({ focus, dnes }: { focus: Exclude<Focus, { kind: 'ziadny' }>; dnes: ISODate }) {
  const sprint = focus.sprint;
  const after = sprinty
    .filter((s) => s.od > sprint.od)
    .sort((a, b) => (a.od < b.od ? -1 : 1))
    .slice(0, SHEET_OPACITY.length);
  const length = sprintLength(sprint);
  const day = focus.kind === 'prebieha' ? sprintDay(sprint, dnes) : focus.kind === 'po' ? length : 0;

  return (
    <div className="scene">
      <div className="stage">
        <div className="stack">
          <div className="floor" aria-hidden="true">
            <svg viewBox="0 0 340 360">
              <use href="#shp" />
            </svg>
          </div>
          {[...after].reverse().map((s, i) => {
            const fromTop = after.length - 1 - i;
            const style = { '--i': i, '--o': SHEET_OPACITY[fromTop] } as CSSProperties;
            return (
              <div key={s.cislo} className="sh" style={style} aria-hidden="true">
                <svg viewBox="0 0 340 360">
                  <use href="#shp" />
                </svg>
                <span className="sh-l">Šprint {s.cislo}</span>
              </div>
            );
          })}
          <a className="sh top" style={{ '--i': after.length } as CSSProperties} href="#progres">
            <svg viewBox="0 0 340 360" aria-hidden="true">
              <use href="#shp" />
            </svg>
            <span className="tp-k mono up">
              Šprint {sprintNumber(sprint.cislo)} · {formatRange(sprint.od, sprint.do)}
            </span>
            <StatusLabel focus={focus} />
            <span className="tp-t">{sprint.nazov ? typo(sprint.nazov) : `Šprint ${sprint.cislo}`}</span>
            <TeaserText sprint={sprint} />
            <span className="tp-f">
              <span className="ticks-w">
                <span className="ticks" style={{ '--n': length, '--k': day } as CSSProperties} />
              </span>
              <span className="mono">{focus.kind === 'prebieha' ? `deň ${day} zo ${length}` : `${length} dní`}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusLabel({ focus }: { focus: Exclude<Focus, { kind: 'ziadny' }> }) {
  if (focus.kind === 'prebieha') return <span className="live">prebieha</span>;
  if (focus.kind === 'po') return <span className="chip ok">hotový</span>;
  return <span className="chip">začína {formatDay(focus.sprint.od)}</span>;
}

function TeaserText({ sprint }: { sprint: Sprint }) {
  const text = sprint.zhrnutie ?? (sprint.ciel && !isTodo(sprint.ciel) ? sprint.ciel : undefined);
  return text ? <span className="tp-d">{typo(text)}</span> : null;
}
