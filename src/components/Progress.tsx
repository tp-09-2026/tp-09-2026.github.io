import { useState, type CSSProperties } from 'react';
import { dokumenty } from '../content/dokumenty';
import { jiraData } from '../content/jiraData';
import { milniky, semestre, sprinty } from '../content/sprinty';
import { isTodo, type Sprint } from '../content/types';
import { formatDay, formatRange, type ISODate } from '../lib/dates';
import { kategoria, meetingDays, type Dokument, type KategoriaId } from '../lib/documents';
import { updatedLabel } from '../lib/jira';
import {
  calendarCells,
  currentSemester,
  focusSprint,
  semesterPosition,
  semesterSegments,
  semesterWeek,
  semesterWeeks,
  sprintDay,
  sprintsUpTo,
  sprintLength,
  sprintNumber,
  sprintStatus,
  type Focus,
} from '../lib/sprints';
import { typo } from '../lib/typography';
import { StatusLabel } from './Hero';
import { Icon, Num, Sheet, TodoBadge, Value, cx } from './ui';
import './Progress.css';

const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

export function Progress({ dnes, onShowDocs }: { dnes: ISODate; onShowDocs: (filter: KategoriaId) => void }) {
  const focus = focusSprint(sprinty, dnes);
  return (
    <section className="sec" id="progres">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Progres<sup>02</sup>
          </h2>
          <div className="sec-lead">
            <p className="big bal">Po každom šprinte sem dopíšeme, čo sme stihli.</p>
          </div>
        </header>
        <SemesterRuler dnes={dnes} />
        {focus.kind !== 'ziadny' && <CurrentSprint focus={focus} dnes={dnes} onShowDocs={onShowDocs} />}
        <SprintLog dnes={dnes} />
      </div>
    </section>
  );
}

/** One semester at a time; the one running now is shown first, the other is a click away. */
function SemesterRuler({ dnes }: { dnes: ISODate }) {
  const [selected, setSelected] = useState(() => currentSemester(semestre, dnes));
  if (!selected) return null;
  const semester = selected;
  const weeks = semesterWeeks(semester);
  const week = semesterWeek(semester, dnes);
  const segments = semesterSegments(semester, sprinty);
  const inSemester = week !== null;
  const marks = milniky.filter((m) => semester.od <= m.datum && m.datum <= semester.do);

  return (
    <div className="sem">
      <div className="sem-h">
        <div className="sem-t">
          <h3>{semester.nazov}</h3>
          {semestre.length > 1 && (
            <div className="sem-tabs" role="group" aria-label="Semester">
              {semestre.map((s) => (
                <button key={s.od} type="button" aria-pressed={s === semester} onClick={() => setSelected(s)}>
                  {s.kratky}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="sem-w">
          {inSemester ? (
            <span>
              <b>týždeň {week}</b> z&nbsp;{weeks}
            </span>
          ) : (
            <span>{dnes < semester.od ? `začína ${formatDay(semester.od)}` : 'semester skončil'}</span>
          )}
          {semester.overit && <TodoBadge text="dátumy overiť" />}
        </p>
      </div>
      <div className="ruler-x">
        <div className="ruler">
          <div className="track">
            <div className="weeks" aria-hidden="true" style={{ '--weeks': weeks } as CSSProperties}>
              {Array.from({ length: weeks }, (_, i) => (
                <span key={i} className={week === i + 1 ? 'on' : undefined}>
                  {i + 1}
                </span>
              ))}
            </div>
            <ol className="spr">
              {segments.map((seg) => {
                const style = { '--days': seg.days } as CSSProperties;
                if (seg.kind === 'gap' || !seg.sprint) {
                  return segments.length === 1 ? (
                    <li key={seg.od} className="gap-seg" style={style}>
                      Šprinty tohto semestra ešte nie sú naplánované.
                    </li>
                  ) : (
                    <li key={seg.od} className="gap-seg" style={style} aria-hidden="true" />
                  );
                }
                const status = sprintStatus(seg.sprint, dnes);
                const progress = status === 'prebieha' ? (sprintDay(seg.sprint, dnes) / sprintLength(seg.sprint)) * 100 : 0;
                return (
                  <li key={seg.od} className={cx(status === 'prebieha' && 'cur', status === 'hotovy' && 'done')} style={style}>
                    Šprint {seg.sprint.cislo}
                    {status === 'prebieha' && <i className="fill" style={{ width: `${progress}%` }} />}
                  </li>
                );
              })}
            </ol>
            {inSemester && (
              <span className="dnes" style={{ left: `${semesterPosition(semester, dnes) * 100}%` }}>
                <em>dnes</em>
              </span>
            )}
          </div>
          {marks.length > 0 && (
            <ul className="miles">
              {marks.map((m) => {
                const position = semesterPosition(semester, m.datum);
                return (
                  <li key={m.datum + m.nazov} className={position > 0.82 ? 'end' : undefined} style={{ left: `${position * 100}%` }}>
                    <b>{formatDay(m.datum)}</b>
                    {m.nazov}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CurrentSprint({
  focus,
  dnes,
  onShowDocs,
}: {
  focus: Exclude<Focus, { kind: 'ziadny' }>;
  dnes: ISODate;
  onShowDocs: (filter: KategoriaId) => void;
}) {
  // the panel opens on the current sprint; the arrows go back through closed ones
  const history = sprintsUpTo(sprinty, focus.sprint);
  const [index, setIndex] = useState(history.length - 1);
  const sprint = history[index] ?? focus.sprint;
  const isFocus = sprint === focus.sprint;
  const view: Exclude<Focus, { kind: 'ziadny' }> = isFocus ? focus : { kind: 'po', sprint };
  const length = sprintLength(sprint);
  const day = view.kind === 'prebieha' ? sprintDay(sprint, dnes) : view.kind === 'po' ? length : 0;
  const meetings = meetingDays(dokumenty);
  const cells = calendarCells(sprint, dnes, meetings);
  const minutes = docsInSprint(sprint).filter((d) => d.kategoria === 'zapisnice');

  return (
    <Sheet as="article" className="now" count={2} offset={14} radius={26} aria-labelledby="now-t">
      {history.length > 1 && (
        <nav className="now-nav" aria-label="Šprinty">
          {!isFocus && (
            <button type="button" className="back" onClick={() => setIndex(history.length - 1)}>
              aktuálny
            </button>
          )}
          <button type="button" aria-label="Predchádzajúci šprint" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <Icon name="left" />
          </button>
          <button
            type="button"
            aria-label="Nasledujúci šprint"
            disabled={index === history.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            <Icon name="right" />
          </button>
        </nav>
      )}
      <div key={sprint.cislo} className="now-swap">
        <div className="now-top">
          <Num n={sprintNumber(sprint.cislo)} variant="cur" fill={(day / length) * 100} />
          <div>
            <p className="now-meta">
              <span className="mono up">
                Šprint {sprintNumber(sprint.cislo)} · {formatRange(sprint.od, sprint.do, true)}
              </span>
              <StatusLabel focus={view} />
            </p>
            <h3 id="now-t">{sprint.nazov ? typo(sprint.nazov) : `Šprint ${sprint.cislo}`}</h3>
            <p className="goal">
              <span className="lbl">Cieľ</span>
              {sprint.ciel === undefined ? (
                'Cieľ doplníme na plánovaní šprintu.'
              ) : isTodo(sprint.ciel) ? (
                <TodoBadge text={sprint.ciel.todo} />
              ) : (
                typo(sprint.ciel)
              )}
            </p>
          </div>
        </div>
        <div className="now-body">
          <div>
            <p className="tasks-h">
              <span className="lbl">Úlohy</span>
              {sprint.ulohyZJiry && jiraData && (
                <span className="mono">z Jiry · {updatedLabel(jiraData.aktualizovane)}</span>
              )}
            </p>
            {sprint.ulohy && sprint.ulohy.length > 0 ? (
              <ul className="tasks">
                {sprint.ulohy.map((u) => (
                  <li key={u.text} className={cx(u.stav === 'hotova' && 't-done', u.stav === 'rozpracovana' && 't-wip')}>
                    <span className="ck">{u.stav === 'hotova' && <Icon name="check" />}</span>
                    <span className="tx">{typo(u.text)}</span>
                    <span className="sr">{u.stav === 'hotova' ? 'hotová' : u.stav === 'rozpracovana' ? 'rozpracovaná' : 'čaká'}</span>
                    {u.stav === 'rozpracovana' && <span className="live" aria-hidden="true">prebieha</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">Úlohy doplníme na plánovaní šprintu.</p>
            )}
            {view.kind === 'po' && sprint.vysledky && sprint.vysledky.length > 0 && (
            <>
              <span className="lbl res-h">Výsledky</span>
              <ul className="res">
                {sprint.vysledky.map((v) => (
                  <li key={v}>
                    <Icon name="check" />
                    {typo(v)}
                  </li>
                ))}
              </ul>
            </>
          )}
          {sprint.ulohyPoznamka && (
              <p className="tasks-note">
                <TodoBadge text={sprint.ulohyPoznamka.todo} />
              </p>
            )}
          </div>
          <div className="now-cal">
            <span className="lbl">{formatRange(sprint.od, sprint.do)}</span>
            <div className="cal">
              {DNI.map((d) => (
                <span key={d} className="dh">
                  {d}
                </span>
              ))}
              {cells.map((c) => (
                <span
                  key={c.iso}
                  className={cx(
                    'd',
                    !c.inSprint && 'out',
                    c.inSprint && c.today && 'tdy',
                    c.inSprint && !c.today && c.weekend && 'we',
                    c.inSprint && !c.today && !c.weekend && c.past && 'past',
                    c.inSprint && c.meeting && 'meet',
                  )}
                  aria-current={c.today ? 'date' : undefined}
                >
                  {c.day}
                </span>
              ))}
            </div>
            <div className="cal-foot">
              {meetings.size > 0 && (
                <span className="leg">
                  <i className="leg-m" />
                  stretnutie tímu
                </span>
              )}
              {view.kind === 'prebieha' && (
                <span className="leg">
                  <i className="leg-t" />
                  dnes
                </span>
              )}
            </div>
            <div className="cal-prog">
              <span className="ticks-w">
                <span className="ticks" style={{ '--n': length, '--k': day } as CSSProperties} />
              </span>
              <span className="mono">{view.kind === 'prebieha' ? `deň ${day} zo ${length}` : `${length} dní`}</span>
            </div>
            {(sprint.jira !== undefined || minutes.length > 0) && (
              <div className="now-links">
                {sprint.jira === undefined ? null : isTodo(sprint.jira) ? (
                  <span className="na">
                    Šprint v Jire <TodoBadge text={sprint.jira.todo} />
                  </span>
                ) : (
                  <a className="u" href={sprint.jira} target="_blank" rel="noopener">
                    Šprint v Jire
                    <Icon name="arr" />
                  </a>
                )}
                {minutes.length > 0 && (
                  <a className="u" href="#dokumenty" onClick={() => onShowDocs('zapisnice')}>
                    Zápisnice z tohto šprintu<span className="cnt">{minutes.length}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function docsInSprint(sprint: Sprint): Dokument[] {
  return dokumenty.filter((d) => sprint.od <= d.datum && d.datum <= sprint.do);
}

function SprintLog({ dnes }: { dnes: ISODate }) {
  const sorted = [...sprinty].sort((a, b) => (a.od < b.od ? -1 : 1));
  const done = sorted.filter((s) => sprintStatus(s, dnes) === 'hotovy');
  const rest = sorted.filter((s) => sprintStatus(s, dnes) !== 'hotovy');

  return (
    <div className="log">
      <div className="log-h">
        <h3>Šprinty</h3>
      </div>
      {done.map((s) => (
        <DoneSprint key={s.cislo} sprint={s} />
      ))}
      {rest.length > 0 && (
        <div className="lg-row">
          {rest.map((s, index) => {
            const status = sprintStatus(s, dnes);
            const fill = status === 'prebieha' ? (sprintDay(s, dnes) / sprintLength(s)) * 100 : undefined;
            // the running sprint glows, the next one is outlined, later ones fade out
            const variant = status === 'prebieha' ? 'cur' : index <= 1 ? undefined : 'dim';
            return (
              <article key={s.cislo} className="lg-c">
                <Num n={sprintNumber(s.cislo)} variant={variant} fill={fill} />
                <p className="lg-meta">
                  <span className="mono up">
                    Šprint {sprintNumber(s.cislo)} · {formatRange(s.od, s.do)}
                  </span>
                </p>
                {status === 'prebieha' ? <span className="live">prebieha</span> : <span className="chip">plánovaný</span>}
                {s.nazov && <h4>{typo(s.nazov)}</h4>}
                {status === 'planovany' && !s.ciel && <p className="lg-goal">Cieľ doplníme na plánovaní šprintu.</p>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DoneSprint({ sprint }: { sprint: Sprint }) {
  const tasks = sprint.ulohy ?? [];
  const finished = tasks.filter((t) => t.stav === 'hotova').length;
  const docs = docsInSprint(sprint);
  return (
    <article className="lg">
      <div>
        <Num n={sprintNumber(sprint.cislo)} variant="full" />
      </div>
      <div>
        <p className="lg-meta">
          <span className="mono up">
            Šprint {sprintNumber(sprint.cislo)} · {formatRange(sprint.od, sprint.do)}
          </span>
          <span className="chip ok">
            <Icon name="check" />
            hotový
          </span>
        </p>
        <h4>{sprint.nazov ? typo(sprint.nazov) : `Šprint ${sprint.cislo}`}</h4>
        {sprint.ciel !== undefined && (
          <p className="lg-goal">
            Cieľ: <Value value={sprint.ciel} />
          </p>
        )}
        <div className="lg-grid">
          {sprint.vysledky && sprint.vysledky.length > 0 ? (
            <ul className="res">
              {sprint.vysledky.map((v) => (
                <li key={v}>
                  <Icon name="check" />
                  {typo(v)}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <TodoBadge text="výsledky doplníme" />
            </p>
          )}
          {tasks.length > 0 ? (
            <div className="score">
              <span className="meter" aria-hidden="true">
                {tasks.map((_, i) => (
                  <i key={i} className={i < finished ? 'on' : undefined} />
                ))}
              </span>
              <p>
                splnené {finished} z&nbsp;{tasks.length}
              </p>
            </div>
          ) : (
            <div />
          )}
          {docs.length > 0 && (
            <ul className="lg-docs">
              {docs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target="_blank" rel="noopener">
                    <Icon name={kategoria(d.kategoria).ikona} />
                    {d.nazov}
                    <Icon name="arr" className="go" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
