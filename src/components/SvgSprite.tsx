/**
 * Shared SVG definitions, rendered once at the top of the page and referenced
 * everywhere with <use href="#…">: the ECEH gradient, the logo mark, the sheet
 * shapes and the icons (Lucide, MIT licence).
 */
export function SvgSprite() {
  return (
    <svg className="sprite" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ecehG" x1="0" y1="0" x2="1" y2=".35">
          <stop offset="0" stopColor="#43cfd8" />
          <stop offset="1" stopColor="#7cd359" />
        </linearGradient>
        <linearGradient id="gM" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#43cfd8" />
          <stop offset=".6" stopColor="#7cd359" />
          <stop offset="1" stopColor="#d4f06b" />
        </linearGradient>
        {/* one sprint sheet in the logo geometry (340×360, bottom-left corner cut) */}
        <path id="shp" d="M.75 .75H315.25A24 24 0 0 1 339.25 24.75V335.25A24 24 0 0 1 315.25 359.25H48.75L.75 311.25Z" />
        {/* a flat isometric sheet for the team history */}
        <path id="iso" d="M2 27 46 2 90 27 51.3 49H40.7Z" />
        <symbol id="logo" viewBox="0 0 512 512">
          <g stroke="url(#ecehG)" strokeWidth="26">
            <path d="M49.5 127.5H424.5A28 28 0 0 1 452.5 155.5V452A28 28 0 0 1 424.5 480H139.5L49.5 392Z" />
            <path d="M49.5 83.5H379.5A28 28 0 0 1 407.5 111.5V408A28 28 0 0 1 379.5 436H94.5L49.5 392Z" />
            <path d="M49.5 39.5H334.5A28 28 0 0 1 362.5 67.5V364A28 28 0 0 1 334.5 392H49.5Z" />
          </g>
        </symbol>
        <symbol id="i-file" viewBox="0 0 24 24">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </symbol>
        <symbol id="i-pres" viewBox="0 0 24 24">
          <path d="M2 3h20" />
          <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
          <path d="m7 21 5-5 5 5" />
        </symbol>
        <symbol id="i-arr" viewBox="0 0 24 24">
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </symbol>
        <symbol id="i-down" viewBox="0 0 24 24">
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </symbol>
        <symbol id="i-left" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </symbol>
        <symbol id="i-right" viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="M20 6 9 17l-5-5" />
        </symbol>
        <symbol id="i-kanban" viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M8 7v7" />
          <path d="M12 7v4" />
          <path d="M16 7v9" />
        </symbol>
        <symbol id="i-book" viewBox="0 0 24 24">
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </symbol>
        <symbol id="i-copy" viewBox="0 0 24 24">
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </symbol>
        <symbol id="i-moon" viewBox="0 0 24 24">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </symbol>
        <symbol id="i-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </symbol>
      </defs>
    </svg>
  );
}
