/**
 * Členovia tímu (abecedne podľa priezviska) a vedenie.
 * Fotky na stránke nie sú, každého člena zastupujú iniciály.
 * Rolu dopíš, keď je naisto dohodnutá (rola: 'Scrum master'). Kým ju niekto nemá,
 * stránka ukáže štítok „roly doplníme".
 */
import { todo, type Clen, type Osoba } from './types';

export const clenovia: Clen[] = [
  { meno: 'Viktor Bejtic', rola: todo('rola') },
  { meno: 'Martin Demčák', rola: todo('rola') },
  { meno: 'Adam Strelec', rola: todo('rola') },
  { meno: 'Nikola Šašinková Slivková', rola: todo('rola') },
  { meno: 'Adela Škulavíková', rola: 'DevOps engineer' },
  { meno: 'Martin Štefanko', rola: todo('rola') },
  { meno: 'Ladislav Štefún', rola: todo('rola') },
];

export const vedenie: { veduci: Osoba; productOwner: Osoba } = {
  veduci: { funkcia: 'Vedúci tímu', meno: 'Martin Štefanko' },
  productOwner: { funkcia: 'Product owner', meno: 'doc. Ing. Ján Lang, PhD.' },
};
