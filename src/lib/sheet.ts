/**
 * SVG outlines in the geometry of the ECEH logo: a sheet with square left corners,
 * rounded right corners and (optionally) the bottom-left corner cut diagonally.
 * "Back" sheets peek out to the right and below, joined to the front sheet by the
 * same diagonal as in the logo.
 */

const INSET = 0.75; // half of the stroke, so the line is not clipped at the edge

function r2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Front sheet of size w×h with corner radius r and a diagonal cut of size c (0 = no cut). */
export function frontSheetPath(w: number, h: number, r: number, c = 0): string {
  const i = INSET;
  const W = w - i;
  const H = h - i;
  return (
    `M${i} ${i}H${r2(W - r)}A${r} ${r} 0 0 1 ${r2(W)} ${r2(i + r)}` +
    `V${r2(H - r)}A${r} ${r} 0 0 1 ${r2(W - r)} ${r2(H)}` +
    `H${r2(i + c)}${c ? `L${i} ${r2(H - c)}` : ''}Z`
  );
}

/** A sheet behind the front one, shifted right and down by `offset`. */
export function backSheetPath(w: number, h: number, r: number, offset: number): string {
  const i = INSET;
  const W = w - i + offset;
  const H = h - i;
  return (
    `M${i} ${r2(i + offset)}H${r2(W - r)}A${r} ${r} 0 0 1 ${r2(W)} ${r2(i + offset + r)}` +
    `V${r2(H + offset - r)}A${r} ${r} 0 0 1 ${r2(W - r)} ${r2(H + offset)}` +
    `H${r2(i + offset)}L${i} ${r2(H)}Z`
  );
}
