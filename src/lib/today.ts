import { isISODate, type ISODate } from './dates';

/**
 * Today's date in Slovakia as "RRRR-MM-DD". Sprint states, the calendar and the
 * semester marker are all computed from it, so nobody has to flip statuses by hand.
 *
 * For previews and screenshots the date can be overridden with `?dnes=RRRR-MM-DD`
 * in the page URL.
 */
export function today(search: string = globalThis.location?.search ?? '', now: Date = new Date()): ISODate {
  const override = new URLSearchParams(search).get('dnes');
  if (override && isISODate(override)) return override;
  // The "sv-SE" locale formats dates as RRRR-MM-DD; the time zone makes the day
  // switch at midnight in Bratislava, not at midnight UTC.
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava' }).format(now);
}
