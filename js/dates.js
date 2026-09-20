/**
 * Date helpers, all working in local time on 'YYYY-MM-DD' strings.
 *
 * The one rule this file exists to enforce: never build a Date from a bare
 * 'YYYY-MM-DD' string. `new Date('2026-09-20')` is parsed as UTC midnight,
 * so anyone west of Greenwich gets the 19th back. Every parse here goes
 * through fromISO(), which constructs from explicit parts and therefore
 * lands on local midnight wherever the user happens to be.
 */

export const WEEKDAY_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Calendar grids start on Monday.
export const WEEKDAY_INITIALS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** How far ahead a booking may be made. */
export const MAX_MONTHS_AHEAD = 24;

/** 'YYYY-MM-DD' -> Date at local midnight. */
export function fromISO(iso) {
  if (typeof iso !== 'string') return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // Rejects 2026-02-30 and friends, which JS would otherwise roll forward.
  if (date.getFullYear() !== Number(y) ||
      date.getMonth() !== Number(m) - 1 ||
      date.getDate() !== Number(d)) {
    return null;
  }
  return date;
}

/** Date -> 'YYYY-MM-DD' using local parts, never toISOString(). */
export function toISO(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidISO(iso) {
  return fromISO(iso) !== null;
}

export function todayISO() {
  return toISO(new Date());
}

/** Add days, correctly crossing month, year and DST boundaries. */
export function addDays(iso, days) {
  const date = fromISO(iso);
  if (!date) return '';
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function addMonths(iso, months) {
  const date = fromISO(iso);
  if (!date) return '';
  const targetDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  // Clamp: adding a month to 31 Jan gives 28/29 Feb, not 3 March.
  const lastDay = daysInMonth(date.getFullYear(), date.getMonth());
  date.setDate(Math.min(targetDay, lastDay));
  return toISO(date);
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Whole days from a to b. Negative when b is earlier. */
export function daysBetween(aISO, bISO) {
  const a = fromISO(aISO);
  const b = fromISO(bISO);
  if (!a || !b) return 0;
  // Compare at noon so a DST shift cannot round the difference wrong.
  a.setHours(12, 0, 0, 0);
  b.setHours(12, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

export function compareISO(a, b) {
  return a === b ? 0 : (a < b ? -1 : 1);
}

export function isBefore(a, b) {
  return compareISO(a, b) < 0;
}

/** The last date a booking may be made for. */
export function maxBookableISO() {
  return addMonths(todayISO(), MAX_MONTHS_AHEAD);
}

export function isBookable(iso) {
  if (!isValidISO(iso)) return false;
  return !isBefore(iso, todayISO()) && !isBefore(maxBookableISO(), iso);
}

// ------------------------------------------------------------- formatting

/** 'Sun 20 Sep 2026' */
export function formatMedium(iso) {
  const date = fromISO(iso);
  if (!date) return '';
  return `${WEEKDAY_SHORT[date.getDay()]} ${date.getDate()} ${MONTH_LONG[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

/** 'Sunday, 20 September 2026' */
export function formatLong(iso) {
  const date = fromISO(iso);
  if (!date) return '';
  return `${WEEKDAY_LONG[date.getDay()]}, ${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** '20 Sep' — for compact chips */
export function formatShort(iso) {
  const date = fromISO(iso);
  if (!date) return '';
  return `${date.getDate()} ${MONTH_LONG[date.getMonth()].slice(0, 3)}`;
}

export function weekdayLong(iso) {
  const date = fromISO(iso);
  return date ? WEEKDAY_LONG[date.getDay()] : '';
}

export function monthLabel(year, monthIndex) {
  return `${MONTH_LONG[monthIndex]} ${year}`;
}

/** 'Today', 'Tomorrow', 'In 5 days', 'In 3 months' — relative context. */
export function relativeLabel(iso) {
  const delta = daysBetween(todayISO(), iso);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta < 0) return `${Math.abs(delta)} days ago`;
  if (delta < 7) return `In ${delta} days`;
  if (delta < 31) {
    const weeks = Math.round(delta / 7);
    return `In ${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  const months = Math.round(delta / 30.4);
  return `In ${months} month${months === 1 ? '' : 's'}`;
}

/**
 * The 6x7 grid for a month, Monday first.
 * Returns 42 entries so the grid never changes height between months.
 */
export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  // getDay() is Sunday-based; shift so Monday is column 0.
  const leading = (first.getDay() + 6) % 7;

  const cells = [];
  const start = new Date(year, monthIndex, 1 - leading);
  for (let i = 0; i < 42; i++) {
    const cell = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({
      iso: toISO(cell),
      day: cell.getDate(),
      inMonth: cell.getMonth() === monthIndex && cell.getFullYear() === year,
    });
  }
  return cells;
}
