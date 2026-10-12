/**
 * Členovia tímu (abecedne podľa priezviska) a vedenie.
 * Fotky na stránke nie sú, každého člena zastupujú iniciály.
 * Rolu dopíš, keď je naisto dohodnutá (rola: 'Scrum master'). Kým ju niekto nemá,
 * stránka ukáže štítok „roly doplníme".
 */
import type { Clen, Osoba } from './types';

export const clenovia: Clen[] = [
  { meno: 'Viktor Bejtic', rola: 'Backend developer' },
  { meno: 'Martin Demčák', rola: 'Backend developer' },
  { meno: 'Adam Strelec', rola: 'Frontend developer' },
  { meno: 'Nikola Šašinková Slivková', rola: 'Business analyst · Scrum master' },
  { meno: 'Adela Škulavíková', rola: 'DevOps engineer' },
  { meno: 'Martin Štefanko', rola: 'Team lead · Frontend developer' },
  { meno: 'Ladislav Štefún', rola: 'Backend developer · QA engineer' },
];

export const vedenie: { veduci: Osoba; productOwner: Osoba } = {
  veduci: { funkcia: 'Vedúci tímu', meno: 'Martin Štefanko' },
  productOwner: { funkcia: 'Product owner', meno: 'doc. Ing. Ján Lang, PhD.' },
};
