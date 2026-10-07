/**
 * Členovia tímu (abecedne podľa priezviska) a vedenie.
 * Fotky na stránke nie sú, každého člena zastupujú iniciály.
 * Roly doplníme naraz pre všetkých, keď budú rozdelené (rola: 'Scrum master').
 */
import { todo, type Clen, type Osoba } from './types';

export const clenovia: Clen[] = [
  { meno: 'Viktor Bejtic', rola: todo('rola') },
  { meno: 'Martin Demčák', rola: todo('rola') },
  { meno: 'Adam Strelec', rola: todo('rola') },
  { meno: 'Nikola Šašinková Slivková', rola: todo('rola') },
  { meno: 'Adela Škulavíková', rola: todo('rola') },
  { meno: 'Martin Štefanko', rola: todo('rola') },
  { meno: 'Ladislav Štefún', rola: todo('rola') },
];

export const vedenie: { veduci: Osoba; productOwner: Osoba } = {
  veduci: { funkcia: 'Vedúca tímu', meno: 'Nikola Šašinková Slivková' },
  productOwner: { funkcia: 'Product owner', meno: 'doc. Ing. Ján Lang, PhD.' },
};
