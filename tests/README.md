# TravelFix regression tests

Headless browser checks covering the four defects fixed in this repo. The site
itself still has **zero dependencies** — these tests are the only thing that
needs an install, and they live entirely in this folder.

## Setup

```bash
cd tests
npm ci
npx playwright install chromium   # skip if Chromium is already available
```

`npm ci` installs exactly what `package-lock.json` records and fails if the
lockfile and `package.json` disagree. To change a dependency, edit
`package.json`, run `npm install` once to update the lockfile, and commit both.

## Running

Start the site first, from the repo root:

```bash
python server.py          # serves http://localhost:8080
```

Then:

```bash
node tests/run-all.js     # all five suites, one summary, non-zero exit on failure
node tests/test-xss.js    # or a single suite
```

Screenshots land in `tests/screenshots/`.

### Pointing at a different build

```bash
TF_URL=http://localhost:8090/index.html node tests/run-all.js
```

## The suites

| Suite | Covers |
|---|---|
| `test-chat` | Trip Chat send path, live re-render of replies, subscriber isolation |
| `test-plan` | Catalogue integrity (no duplicate ids) and budget arithmetic |
| `test-sched` | Empty default plan, date/time picker, moving items between dates |
| `test-stay` | Hotel reservation merged into the scheduling dialog: nights, guests, room tier, live pricing, consecutive-night blocks |
| `test-calendar` | Real calendar dates: two-year range, past dates refused, month and year navigation, stays spanning month boundaries, chronological ordering |
| `test-ocean` | Ocean panel quick picks and Close Explorer |
| `test-xss` | 10 injection vectors: chat (live + persisted), collaborators, geocoder results, generated destinations, stay dialog, plan titles, map pin labels |
| `test-signin` | Account UI: log in / sign up tabs, password rules, reveal toggle, wrong-password handling, session persistence, HttpOnly cookie, magic link, sign out |
| `test-invites` | Invite dialog, invite link opened signed out, sign up and join, editor edits reach the owner, viewer edits are put back (needs `TF_SERVER_LOG`) |
| `test-groupchat` | Two browsers on one shared plan: local notes when signed out, the plan's conversation when signed in, messages both ways by polling, author and role shown, markup shown as text, unread count, nothing shared left in localStorage (needs `TF_SERVER_LOG`) |
| `test-account` | Account menu: download my data as a dated JSON file, delete-account dialog (typed address, wrong password refused, signed out afterwards) |
| `test-plansync` | Server-side plans across two browser contexts: upload on first sign-in, a plan made on one device appears on the other, edits and deletes sync, sign-out returns to local plans |
| `test-smoke` | Nothing broke: normal rendering, images, map markers, 3D globe init |

## The sign-in API suite

`tests/test_auth.py` is separate because it talks to the API rather than the
browser, and needs nothing but Python:

```bash
python server.py            # terminal 1
python tests/test_auth.py   # terminal 2
```

125 checks: validation, password strength rules, hash storage and per-password
salting, account enumeration, login timing equivalence, SQL injection
attempts, token storage and replay, expiry, superseded links, password
changes, cookie flags, cross-origin rejection, security headers, whether
anything outside `index.html`, `css/`, `js/` and `assets/` is reachable over
HTTP (encoded, doubled-slash, dot-segment and case variants, HEAD included),
rate limiting, and oversized bodies.

It writes to the database directly, including login tokens for the account
with the lowest id, so point the server at a throwaway database rather than
your own:

```bash
DB_PATH=/tmp/tf-test.db python server.py
```

## The plans API suite

`tests/test_plans.py` covers `/api/plans`, run the same way as the sign-in
suite:

```bash
python server.py             # terminal 1
python tests/test_plans.py   # terminal 2
```

47 checks: sign-in required, owner create/read/update/delete, persistence
across a second login, and, for every endpoint, that a non-member gets the
same 404 as for a plan that does not exist. Also validation, oversized bodies,
malformed ids and cross-origin rejection. It creates three accounts, so on a
server that has already run `test_auth.py` it can hit the per-IP signup limit;
restart the server between the two.

## The invites suites

The raw invite token only ever exists in the email, so with mail off both
invite suites read links from the server's console output:

```bash
DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
TF_DB=/tmp/tf-test.db TF_SERVER_LOG=/tmp/tf-server.log python tests/test_invites.py
TF_SERVER_LOG=/tmp/tf-server.log node tests/test-invites.js
```

`tests/test_invites.py`, 59 checks: the token is 32 bytes and only its SHA-256
is stored, it expires in exactly 7 days, it works once, the role is fixed at
creation, a forwarded link fails for another account, an unverified address
cannot send or accept, expired and revoked links are refused exactly like
made-up ones, editors can edit but not invite, viewers can only read, and
every invite endpoint gives a non-member the same 404 as a plan that does not
exist. It writes to the database directly, so use a throwaway one.

`tests/test_account.py` covers data export and account deletion, run the same
way (`TF_DB` and `TF_SERVER_LOG`): the export holds the account, its plans and
invites but no hashes; deletion needs the typed address and the password;
afterwards the account cannot sign in, its owned plans are gone for the
people they were shared with, it is gone from other people's plans, and its
address appears neither in the database nor in the raw bytes of the file.
`tests/test-account.js` drives the account menu's download and delete.

`tests/test_chat.py` (47 checks) covers `/api/plans/<id>/messages` the same
way: members of every role can read and post, `?after=` returns only newer
messages, a non-member gets the same 404 as a missing plan on both endpoints,
control and bidi-override characters are stripped, over-long or non-string
text is refused, card fields outside each card type are dropped, bad card
values (unknown type, non-id destination, oversized lists, non-numeric or
negative numbers) are refused, and a deleted plan takes its chat with it.

`tests/test-invites.js` drives the real UI in three browsers: the owner sends
an invite from the dialog, the invitee opens the link signed out, signs up
with that address and lands in the plan; an editor's change reaches the
owner, and a viewer's edit is put back.

## Using this as a ground-truth set

The first commit on `main` is the original, unmodified code. Every suite here
fails against it and passes against `HEAD`, which makes the pair usable for
validating a security scanner:

```bash
git worktree add /tmp/tf-baseline $(git rev-list --max-parents=0 HEAD)
cd /tmp/tf-baseline && sed -i 's/^PORT = 8080/PORT = 8090/' server.py && python server.py &
cd - && TF_URL=http://localhost:8090/index.html node tests/run-all.js
```

Expected: the baseline fails the great majority of these checks; HEAD passes all 91.
The suite has grown well past the four original defects, so many newer checks
cover features that simply do not exist in the baseline at all.

The known defects, with locations in the baseline commit:

| Defect | Location in baseline | Class |
|---|---|---|
| Stored XSS via chat, plus ~60 unescaped sinks | `js/ui.js`, `js/map.js`, `js/globe.js` | CWE-79 |
| Chat send throws on a missing UI member | `js/app.js:54` | Crash |
| Duplicate `tokyo` destination id | `js/data.js:664` and `:1464` | Data integrity |
| `DESTINATIONS` used but never imported | `js/ui.js:556` | Crash |
| `closeSidePanel()` called but never defined | `js/ui.js:537` | Crash |

## A caveat about the screenshots

Headless Chromium mis-composites Leaflet's transformed map panes over the
floating dashboard, so the panel can come out blank in a full-page capture even
though it renders correctly in a real browser. `lib.js` exports `hideMap()` to
work around this — it is a capture artifact, not a site bug.
