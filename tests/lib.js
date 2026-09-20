const { chromium } = require('playwright');
const fs = require('fs');
const SP = __dirname;
const SHOTS = process.env.TF_SHOTS || require('path').join(__dirname, 'screenshots');
require('fs').mkdirSync(SHOTS, { recursive: true });
const IMG = fs.readFileSync(SP + '/ph-dark.png');
const TILE = fs.readFileSync(SP + '/ph-tile.png');
const URL = process.env.TF_URL || 'http://localhost:8080/index.local.html';

async function ctx(b, vp = { width: 1600, height: 950 }, extra = {}) {
  const c = await b.newContext({ viewport: vp, ...extra });
  await c.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://localhost')) return r.continue();
    if (/arcgisonline|cartocdn|tile\./.test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: TILE });
    if (/unsplash/.test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: IMG });
    if (/fonts\.g/.test(u)) return r.fulfill({ status: 200, contentType: 'text/css', body: '' });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  return c;
}

// Headless Chromium mis-composites Leaflet's transformed panes over the
// floating UI. Hiding the map wrapper gives an accurate panel screenshot.
const hideMap = p => p.evaluate(() => { const m = document.getElementById('map-view-wrapper'); if (m) m.style.display = 'none'; });
const showMap = p => p.evaluate(() => { const m = document.getElementById('map-view-wrapper'); if (m) m.style.display = ''; });

async function page(c) {
  const p = await c.newPage();
  p.__errors = [];
  p.on('pageerror', e => p.__errors.push('PAGEERROR: ' + e.message.slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error') p.__errors.push('CONSOLE: ' + m.text().slice(0, 200)); });
  await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  return p;
}

const errs = p => [...new Set(p.__errors)];

let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}
function summary() {
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exitCode = 1;
}

module.exports = { chromium, ctx, page, hideMap, showMap, errs, check, summary, SP: SHOTS, URL };
