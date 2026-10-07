import { createElement, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { isTodo, type Maybe } from '../content/types';
import { backSheetPath, frontSheetPath } from '../lib/sheet';

export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}

export type IconName =
  | 'file'
  | 'pres'
  | 'arr'
  | 'down'
  | 'check'
  | 'kanban'
  | 'book'
  | 'copy'
  | 'moon'
  | 'sun'
  | 'left'
  | 'right';

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={cx('i', className)} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function EcehMark() {
  return (
    <svg className="mark" aria-hidden="true" focusable="false">
      <use href="#logo" />
    </svg>
  );
}

/** Amber "doplníme" badge for information we do not have yet. */
export function TodoBadge({ text }: { text: string }) {
  return <span className="todo">{text}</span>;
}

/** Renders a real value, or the badge when the value is still `todo(...)`. */
export function Value({ value }: { value: Maybe<string> }) {
  return isTodo(value) ? <TodoBadge text={value.todo} /> : <>{value}</>;
}

/** Big outlined numeral; `fill` (0–100) is how high the mesh colour rises inside. */
export function Num({
  n,
  variant,
  fill,
  className,
}: {
  n: string;
  variant?: 'cur' | 'full' | 'dim';
  fill?: number;
  className?: string;
}) {
  const style = fill === undefined ? undefined : ({ '--nf': `${fill}%` } as CSSProperties);
  return (
    <span className={cx('num', variant, className)} data-n={n} aria-hidden="true" style={style}>
      {n}
    </span>
  );
}

type SheetTag = 'div' | 'article' | 'a';

interface SheetProps {
  as?: SheetTag;
  /** "logo": back sheets peek out like in the logo; "cut": back sheets fan out on hover */
  mode?: 'logo' | 'cut';
  /** how many sheets are drawn behind the front one */
  count?: number;
  /** distance between sheets in "logo" mode */
  offset?: number;
  radius?: number;
  cut?: number;
  className?: string;
  children: ReactNode;
  [attribute: string]: unknown;
}

/**
 * A box framed by an outline in the ECEH logo geometry. The outline is an SVG
 * sized to the element (a ResizeObserver redraws it when the box changes size),
 * because CSS borders cannot draw a gradient line around a cut corner.
 */
export function Sheet({
  as = 'div',
  mode = 'logo',
  count = 0,
  offset = 7,
  radius = 18,
  cut = 20,
  className,
  children,
  ...rest
}: SheetProps) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let outline: ReactNode = null;
  if (size && size.w > 0 && size.h > 0) {
    const r = Math.min(radius, (size.h - 2) / 2, (size.w - 2) / 2);
    const c = mode === 'cut' ? Math.min(cut, (size.h - 2) / 2) : 0;
    const paths: ReactNode[] = [];
    for (let k = count; k >= 0; k--) {
      const d = k === 0 || mode === 'cut' ? frontSheetPath(size.w, size.h, r, c) : backSheetPath(size.w, size.h, r, k * offset);
      const style = k ? ({ '--k': k } as CSSProperties) : undefined;
      paths.push(<path key={k} className={k ? `b b${k}` : 'f'} d={d} style={style} />);
    }
    outline = (
      <svg className="sheet-svg" aria-hidden="true" width={size.w} height={size.h}>
        {paths}
      </svg>
    );
  }

  return createElement(as, { ref, className: cx('sheet', className), ...rest }, outline, children);
}

/** "7 študentov", "3 študenti", "1 študent" */
export function studentov(count: number): string {
  if (count === 1) return '1 študent';
  if (count >= 2 && count <= 4) return `${count} študenti`;
  return `${count} študentov`;
}
