/**
 * Month calendar for picking a booking date.
 *
 * Self-contained: builds its own markup into a host element, handles its own
 * navigation, and calls back when a date is chosen. It does not know what a
 * hotel or an activity is.
 *
 * Range is today through two years out. Dates outside that are rendered but
 * disabled, so the boundary is visible rather than mysterious.
 */

import { esc } from './escape.js';
import {
  MONTH_LONG, WEEKDAY_INITIALS,
  addMonths, compareISO, formatLong, fromISO, isBefore, isBookable,
  maxBookableISO, monthGrid, monthLabel, relativeLabel, todayISO, toISO,
} from './dates.js';

export class TravelFixCalendar {
  /**
   * host        element to render into
   * selected    initially selected 'YYYY-MM-DD'
   * marked      Set of dates that already hold something, shown with a dot
   * rangeEnd    optional 'YYYY-MM-DD'; selected..rangeEnd is shaded (stays)
   * onSelect    called with the chosen date
   */
  constructor({ host, selected, marked = new Set(), rangeEnd = null, onSelect }) {
    this.host = host;
    this.selected = isBookable(selected) ? selected : todayISO();
    this.marked = marked;
    this.rangeEnd = rangeEnd;
    this.onSelect = onSelect;

    const anchor = fromISO(this.selected);
    this.viewYear = anchor.getFullYear();
    this.viewMonth = anchor.getMonth();

    this.minISO = todayISO();
    this.maxISO = maxBookableISO();

    this.render();
  }

  setSelected(iso, { moveView = false } = {}) {
    this.selected = iso;
    if (moveView) {
      const date = fromISO(iso);
      if (date) {
        this.viewYear = date.getFullYear();
        this.viewMonth = date.getMonth();
      }
    }
    this.render();
  }

  setRangeEnd(iso) {
    this.rangeEnd = iso;
    this.render();
  }

  setMarked(marked) {
    this.marked = marked;
    this.render();
  }

  /** Months the picker is allowed to show, for the jump dropdown. */
  monthOptions() {
    const options = [];
    const start = fromISO(this.minISO);
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const end = fromISO(this.maxISO);
    while (cursor.getFullYear() < end.getFullYear() ||
           (cursor.getFullYear() === end.getFullYear() && cursor.getMonth() <= end.getMonth())) {
      options.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return options;
  }

  canGoBack() {
    const firstOfView = toISO(new Date(this.viewYear, this.viewMonth, 1));
    return !isBefore(addMonths(firstOfView, -1), toISO(new Date(fromISO(this.minISO).getFullYear(), fromISO(this.minISO).getMonth(), 1)));
  }

  canGoForward() {
    const firstOfView = toISO(new Date(this.viewYear, this.viewMonth, 1));
    const maxFirst = toISO(new Date(fromISO(this.maxISO).getFullYear(), fromISO(this.maxISO).getMonth(), 1));
    return isBefore(firstOfView, maxFirst);
  }

  shift(months) {
    const next = new Date(this.viewYear, this.viewMonth + months, 1);
    this.viewYear = next.getFullYear();
    this.viewMonth = next.getMonth();
    this.render();
  }

  render() {
    if (!this.host) return;

    const cells = monthGrid(this.viewYear, this.viewMonth);
    const today = todayISO();

    const options = this.monthOptions().map(({ year, month }) => {
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const isCurrent = year === this.viewYear && month === this.viewMonth;
      return `<option value="${value}" ${isCurrent ? 'selected' : ''}>${esc(MONTH_LONG[month])} ${year}</option>`;
    }).join('');

    const dayCells = cells.map(cell => {
      const disabled = !isBookable(cell.iso);
      const classes = ['cal-day'];
      if (!cell.inMonth) classes.push('cal-outside');
      if (disabled) classes.push('cal-disabled');
      if (cell.iso === today) classes.push('cal-today');
      if (cell.iso === this.selected) classes.push('cal-selected');
      if (this.marked.has(cell.iso)) classes.push('cal-marked');
      if (this.rangeEnd &&
          compareISO(cell.iso, this.selected) > 0 &&
          compareISO(cell.iso, this.rangeEnd) < 0) {
        classes.push('cal-in-range');
      }
      if (this.rangeEnd && cell.iso === this.rangeEnd) classes.push('cal-range-end');

      return `
        <button type="button" class="${classes.join(' ')}" data-date="${esc(cell.iso)}"
                ${disabled ? 'disabled aria-disabled="true"' : ''}
                aria-label="${esc(formatLong(cell.iso))}"
                ${cell.iso === this.selected ? 'aria-current="date"' : ''}>
          <span class="cal-day-num">${cell.day}</span>
        </button>`;
    }).join('');

    this.host.innerHTML = `
      <div class="tf-calendar">
        <div class="cal-header">
          <button type="button" class="cal-nav" data-shift="-1"
                  ${this.canGoBack() ? '' : 'disabled'} aria-label="Previous month">&#8249;</button>
          <select class="cal-jump" aria-label="Jump to month">${options}</select>
          <button type="button" class="cal-nav" data-shift="1"
                  ${this.canGoForward() ? '' : 'disabled'} aria-label="Next month">&#8250;</button>
        </div>

        <div class="cal-weekdays">
          ${WEEKDAY_INITIALS.map(d => `<span>${d}</span>`).join('')}
        </div>

        <div class="cal-grid">${dayCells}</div>

        <div class="cal-footer">
          <span class="cal-selected-label">${esc(formatLong(this.selected))}</span>
          <span class="cal-relative">${esc(relativeLabel(this.selected))}</span>
        </div>
      </div>`;

    this.host.querySelectorAll('.cal-nav').forEach(btn => {
      btn.addEventListener('click', () => this.shift(parseInt(btn.dataset.shift, 10)));
    });

    const jump = this.host.querySelector('.cal-jump');
    jump.addEventListener('change', () => {
      const [year, month] = jump.value.split('-').map(Number);
      this.viewYear = year;
      this.viewMonth = month - 1;
      this.render();
    });

    this.host.querySelectorAll('.cal-day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selected = btn.dataset.date;
        // Clicking a trailing or leading cell follows into that month.
        const date = fromISO(this.selected);
        if (date.getMonth() !== this.viewMonth) {
          this.viewYear = date.getFullYear();
          this.viewMonth = date.getMonth();
        }
        this.render();
        if (this.onSelect) this.onSelect(this.selected);
      });
    });
  }
}
