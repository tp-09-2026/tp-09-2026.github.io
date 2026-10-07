import { useState } from 'react';
import { kontakt } from '../content/projekt';
import { isTodo, type Odkaz } from '../content/types';
import { Icon, TodoBadge } from './ui';
import './Contact.css';

export function Contact() {
  const email = kontakt.email;
  return (
    <section className="sec" id="kontakt">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Kontakt<sup>05</sup>
          </h2>
          <p className="big bal">Ak máte otázku k&nbsp;projektu alebo k&nbsp;niečomu na tejto stránke, napíšte nám.</p>
        </header>
        <div className="contact">
          <div className="mail">
            <p className="lbl">E-mail {isTodo(email) && <TodoBadge text={email.todo} />}</p>
            {isTodo(email) ? (
              <p className="mail-a muted">tp09@…</p>
            ) : (
              <>
                <a className="mail-a" href={`mailto:${email}`}>
                  <EmailText email={email} />
                </a>
                <CopyButton text={email} />
              </>
            )}
          </div>
          <ul className="ext">
            {kontakt.odkazy.map((o) => (
              <ExternalLink key={o.nazov} odkaz={o} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** A long address may wrap, but only right before "@", never in the middle of a word. */
function EmailText({ email }: { email: string }) {
  const at = email.indexOf('@');
  if (at < 0) return <>{email}</>;
  return (
    <>
      <span className="mail-part">{email.slice(0, at)}</span>
      <wbr />
      <span className="mail-part">{email.slice(at)}</span>
    </>
  );
}

function ExternalLink({ odkaz }: { odkaz: Odkaz }) {
  const label = (
    <span className="ext-t">
      <b className="u">{odkaz.nazov}</b>
      <span>{odkaz.popis}</span>
    </span>
  );
  // An unknown address is shown as text with a badge, never as a dead "#" link.
  if (isTodo(odkaz.url)) {
    return (
      <li>
        <div>
          {label}
          <TodoBadge text={odkaz.url.todo} />
        </div>
      </li>
    );
  }
  return (
    <li>
      <a href={odkaz.url} target="_blank" rel="noopener">
        {label}
        <Icon name="arr" />
      </a>
    </li>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked: the address is still visible and clickable
    }
  };
  return (
    <button className="copy" type="button" onClick={copy}>
      <Icon name={copied ? 'check' : 'copy'} />
      {copied ? 'Skopírované' : 'Kopírovať'}
    </button>
  );
}
