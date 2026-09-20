#!/usr/bin/env node
/**
 * Runs every TravelFix regression suite and prints a single summary.
 *
 *   node tests/run-all.js
 *   TF_URL=http://localhost:8090/index.local.html node tests/run-all.js
 *
 * Exits non-zero if any check fails, so it works as a CI gate.
 */
const { execFileSync } = require('child_process');
const path = require('path');

const SUITES = ['test-chat', 'test-plan', 'test-ocean', 'test-xss', 'test-smoke'];

let totalPass = 0, totalFail = 0;

for (const suite of SUITES) {
  process.stdout.write(`\n=== ${suite} ===\n`);
  let out = '';
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, suite + '.js')], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 240000
    });
  } catch (err) {
    out = (err.stdout || '') + (err.stderr || '');
  }
  process.stdout.write(out.split('\n').filter(l => /PASS|FAIL/.test(l)).join('\n') + '\n');
  const m = out.match(/(\d+) passed, (\d+) failed/);
  if (m) { totalPass += +m[1]; totalFail += +m[2]; }
  else { console.log('  (suite produced no summary — treating as failure)'); totalFail += 1; }
}

console.log(`\n${'='.repeat(46)}`);
console.log(`TOTAL: ${totalPass} passed, ${totalFail} failed`);
process.exit(totalFail ? 1 : 0);
