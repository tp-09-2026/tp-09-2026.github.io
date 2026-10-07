import { clenovia, vedenie } from '../content/tim';
import { isTodo, type Clen, type Osoba } from '../content/types';
import { Num, TodoBadge, Value } from './ui';
import './Team.css';

export function Team() {
  const rolesMissing = clenovia.some((c) => isTodo(c.rola));
  return (
    <section className="sec" id="tim">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Tím<sup>04</sup>
          </h2>
          <dl className="lead-dl">
            <Lead osoba={vedenie.veduci} />
            <Lead osoba={vedenie.productOwner} />
          </dl>
        </header>
        {rolesMissing && (
          <div className="team-h">
            <TodoBadge text="roly doplníme" />
          </div>
        )}
        <ul className="team">
          {clenovia.map((c) => (
            <Member key={c.meno} clen={c} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Lead({ osoba }: { osoba: Osoba }) {
  return (
    <div>
      <dt>{osoba.funkcia}</dt>
      <dd>
        <Value value={osoba.meno} />
        {osoba.overit && <TodoBadge text="overiť" />}
      </dd>
    </div>
  );
}

/** "Viktor Bejtic" → "VB", "Nikola Šašinková Slivková" → "NŠ" */
export function initials(meno: string): string {
  const words = meno.trim().split(/\s+/);
  return `${words[0]?.charAt(0) ?? ''}${words[1]?.charAt(0) ?? ''}`.toUpperCase();
}

/** No photos on purpose: each member is shown with outlined initials. */
function Member({ clen }: { clen: Clen }) {
  return (
    <li className="mem">
      <div className="ph">
        <Num n={initials(clen.meno)} />
      </div>
      <b>{clen.meno}</b>
      <span className="role">{isTodo(clen.rola) ? 'rola' : clen.rola}</span>
    </li>
  );
}
