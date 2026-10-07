import { tim } from '../content/projekt';
import { formatDay } from '../lib/dates';
import { EcehMark } from './ui';
import './Footer.css';

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-line" aria-hidden="true" />
      <div className="wrap foot-in">
        <p>
          <EcehMark />
          Tím {tim.cislo} · {tim.predmet} {tim.rok} · {tim.fakulta}
        </p>
        <p>Naposledy aktualizované {formatDay(__BUILD_DATE__, true)}</p>
      </div>
    </footer>
  );
}
