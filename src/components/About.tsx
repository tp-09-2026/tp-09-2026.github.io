import type { CSSProperties } from 'react';
import { ciele, historia, historiaOverit, oProjekte } from '../content/projekt';
import { isTodo, type KapitolaHistorie } from '../content/types';
import { typo } from '../lib/typography';
import { Sheet, TodoBadge, cx } from './ui';
import './About.css';

const STAV_CIELA = { planovane: 'plánované', rozpracovane: 'rozpracované', hotove: 'hotové' } as const;

export function About() {
  return (
    <section className="sec" id="projekt">
      <div className="wrap">
        <header className="sec-head">
          <h2>O&nbsp;projekte</h2>
          <div className="sec-lead">
            {isTodo(oProjekte) ? (
              <p>
                <TodoBadge text={oProjekte.todo} />
              </p>
            ) : (
              oProjekte.map((text, i) => (
                <p key={i} className={i === 0 ? 'big' : undefined}>
                  {typo(text)}
                </p>
              ))
            )}
          </div>
        </header>

        <div className="sub">
          <div className="sub-h">
            <h3>Kto na ECEH robil pred nami</h3>
            {historiaOverit && <TodoBadge text="overiť" />}
          </div>
          <ol className="lineage" style={{ '--before': historia.length - 1 } as CSSProperties}>
            {historia.map((kapitola, i) => (
              <Kapitola key={kapitola.rok} kapitola={kapitola} vrstvy={i + 1} medzera={hasGapAfter(i)} />
            ))}
          </ol>
        </div>

        <div className="aims">
          <div className="sub-h">
            <h3>Čo chceme tento rok urobiť</h3>
            {ciele.length === 0 && <TodoBadge text="doplníme po dohode s PO" />}
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Funkcionalita</th>
                <th>Pre koho</th>
                <th>Stav</th>
              </tr>
            </thead>
            <tbody>
              {ciele.length > 0
                ? ciele.map((c) => (
                    <tr key={c.funkcionalita}>
                      <td>{typo(c.funkcionalita)}</td>
                      <td>{c.preKoho}</td>
                      <td>
                        <span className={cx('st', c.stav)}>{STAV_CIELA[c.stav]}</span>
                      </td>
                    </tr>
                  ))
                : [0, 1, 2].map((row) => (
                    <tr key={row} aria-hidden="true">
                      <td className="ell">…</td>
                      <td className="ell">…</td>
                      <td>
                        <span className="st">plánované</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** A dashed line follows a team when the next listed team started more than a year later. */
function hasGapAfter(index: number): boolean {
  const current = historia[index];
  const next = historia[index + 1];
  if (!current || !next) return false;
  return Number.parseInt(next.rok, 10) - Number.parseInt(current.rok, 10) > 1;
}

function Kapitola({ kapitola, vrstvy, medzera }: { kapitola: KapitolaHistorie; vrstvy: number; medzera: boolean }) {
  // every team adds one sheet: the stack grows from left to right
  const sheets = Array.from({ length: vrstvy }, (_, k) => {
    const top = k === vrstvy - 1;
    const className = top ? (kapitola.my ? 'm' : 't') : undefined;
    return <use key={k} className={className} href="#iso" y={40 - k * 8} />;
  });
  const iso = (
    <svg className="iso" viewBox="0 0 92 96" aria-hidden="true">
      {sheets}
    </svg>
  );

  if (kapitola.my) {
    return (
      <li className="us">
        {iso}
        <i className="tl" />
        <Sheet className="us-card" count={2} offset={8} radius={16}>
          <span className="yr">{kapitola.rok}</span>
          <b>{kapitola.nazov}</b>
          {kapitola.poznamka && <span className="who">{typo(kapitola.poznamka)}</span>}
        </Sheet>
      </li>
    );
  }
  return (
    <li className={medzera ? 'gap' : undefined}>
      {iso}
      <i className="tl" />
      <span className="yr">{kapitola.rok}</span>
      <b>{kapitola.nazov}</b>
      {kapitola.kto && <span className="who">{kapitola.kto}</span>}
    </li>
  );
}
