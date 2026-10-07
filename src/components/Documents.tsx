import { dokumenty } from '../content/dokumenty';
import { sprinty } from '../content/sprinty';
import { formatDay } from '../lib/dates';
import { KATEGORIE, documentSprint, kategoria, type KategoriaId } from '../lib/documents';
import { typo } from '../lib/typography';
import { Icon, Sheet } from './ui';
import './Documents.css';

export type DocFilter = 'all' | KategoriaId;

export function Documents({ filter, onFilter }: { filter: DocFilter; onFilter: (f: DocFilter) => void }) {
  const used = KATEGORIE.filter((k) => dokumenty.some((d) => d.kategoria === k.id));
  const visible = filter === 'all' ? dokumenty : dokumenty.filter((d) => d.kategoria === filter);

  return (
    <section className="sec" id="dokumenty">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Dokumenty<sup>03</sup>
          </h2>
          {dokumenty.length > 0 ? (
            <div className="tabs" role="group" aria-label="Typ dokumentu">
              <FilterButton active={filter === 'all'} onClick={() => onFilter('all')} label="Všetko" count={dokumenty.length} />
              {used.map((k) => (
                <FilterButton
                  key={k.id}
                  active={filter === k.id}
                  onClick={() => onFilter(k.id)}
                  label={k.mnozne}
                  count={dokumenty.filter((d) => d.kategoria === k.id).length}
                />
              ))}
            </div>
          ) : (
            <p className="big bal">Zápisnice, retrospektívy a ďalšie dokumenty sem pribudnú po prvých stretnutiach.</p>
          )}
        </header>
        {visible.length > 0 && (
          <ul className="docs">
            {visible.map((d) => {
              const k = kategoria(d.kategoria);
              const sprint = documentSprint(d, sprinty);
              return (
                <li key={d.url}>
                  <Sheet as="a" mode="cut" count={2} radius={16} cut={26} className="doc" href={d.url} target="_blank" rel="noopener">
                    <span className="doc-top">
                      <span className="doc-type">
                        <Icon name={k.ikona} />
                        {k.jednotne}
                      </span>
                      <time className="mono" dateTime={d.datum}>
                        {formatDay(d.datum, true)}
                      </time>
                    </span>
                    <span className="doc-title">{typo(d.nazov)}</span>
                    <span className="doc-foot">
                      <span>{sprint ? `Šprint ${sprint.cislo}` : ''}</span>
                      <span className="pdf">
                        PDF
                        <Icon name="arr" />
                      </span>
                    </span>
                  </Sheet>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button className="tab" type="button" aria-pressed={active} onClick={onClick}>
      {label}
      <span className="c">{count}</span>
    </button>
  );
}
