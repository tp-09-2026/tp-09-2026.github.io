/**
 * Slovak typography: a one-letter word (a, i, k, o, s, u, v, z) must not stay
 * alone at the end of a line. Replacing the space after it with a no-break space
 * glues it to the next word. Content files can therefore use plain spaces.
 *
 * The lookbehind (instead of capturing the preceding space) lets two one-letter
 * words in a row both be handled, e.g. "a v rámci".
 */
export function typo(text: string): string {
  return text.replace(/(?<=^|[\s(„])([aikosuvzAIKOSUVZ])\s+/g, '$1 ');
}
