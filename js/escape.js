/**
 * TravelFix HTML escaping helpers.
 *
 * Every panel in this app is rendered by interpolating values into a template
 * literal and assigning it to innerHTML (or handing it to Leaflet's
 * bindPopup/bindTooltip, which does the same thing). That is fine for values
 * this code controls, but three kinds of data are NOT controlled:
 *
 *   1. Anything the user types — chat messages, @usernames, invite names,
 *      plan titles. Chat is persisted to localStorage, so an unescaped
 *      message is stored XSS: it re-executes on every later page load.
 *   2. Anything returned by a third-party API — place names from OpenStreetMap
 *      Nominatim, POI names from Overpass.
 *   3. Anything derived from the two above, such as the generated
 *      destinations built from a reverse-geocoded map click.
 *
 * Use esc() for text that lands between tags or inside a quoted attribute,
 * and safeUrl() for anything that lands in src=, href= or url().
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Escape a value for interpolation into HTML text or a quoted attribute.
 * Non-string values are coerced; null and undefined become an empty string.
 */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`]/g, ch => HTML_ENTITIES[ch]);
}

/**
 * Escape a value for use inside a CSS url(...) in a style attribute, where
 * an unescaped quote or paren would let the value break out of the
 * declaration. Returns '' for anything that is not a safe absolute http(s)
 * or data:image URL.
 */
export function safeUrl(value) {
  if (!value) return '';
  const raw = String(value).trim();

  // Reject javascript:, vbscript:, data: URLs that are not images, and any
  // value carrying characters that would terminate an attribute or url().
  if (/[\s"'()<>\\]/.test(raw)) return '';
  if (/^https?:\/\//i.test(raw) || /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(raw)) {
    return esc(raw);
  }
  // Allow same-origin relative paths (our own bundled assets).
  if (/^[\w./-]+$/.test(raw) && !raw.startsWith('//')) return esc(raw);
  return '';
}
