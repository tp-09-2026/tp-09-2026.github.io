/**
 * Dokumenty sa načítajú samé: stačí vložiť PDF do správneho priečinka
 * v src/content/dokumenty/ (zapisnice, retrospektivy, metodiky, prezentacie,
 * dokumentacia) s názvom „RRRR-MM-DD_názov.pdf". Netreba tu nič písať.
 */
import { parseDocument, sortDocuments, type Dokument } from '../lib/documents';

// Vite finds every PDF at build time and gives each one a final URL
// (with a content hash, so a replaced file is never served from an old cache).
const files = import.meta.glob<string>('./dokumenty/*/*.pdf', { eager: true, query: '?url', import: 'default' });

export const dokumenty: Dokument[] = sortDocuments(
  Object.entries(files).map(([path, url]) => parseDocument(path, url)),
);
