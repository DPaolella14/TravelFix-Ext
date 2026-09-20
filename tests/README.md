# TravelFix regression tests

Headless browser checks covering the four defects fixed in this repo. The site
itself still has **zero dependencies** — these tests are the only thing that
needs an install, and they live entirely in this folder.

## Setup

```bash
cd tests
npm install
npx playwright install chromium   # skip if Chromium is already available
```

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
| `test-plan` | Showcase itinerary resolves on every day; budget arithmetic |
| `test-ocean` | Ocean panel quick picks and Close Explorer |
| `test-xss` | 10 injection vectors: chat (live + persisted), collaborators, geocoder results, generated destinations, booking modal, plan titles, map pin labels |
| `test-smoke` | Nothing broke: normal rendering, images, map markers, 3D globe init |

## Using this as a ground-truth set

The first commit on `main` is the original, unmodified code. Every suite here
fails against it and passes against `HEAD`, which makes the pair usable for
validating a security scanner:

```bash
git worktree add /tmp/tf-baseline $(git rev-list --max-parents=0 HEAD)
cd /tmp/tf-baseline && sed -i 's/^PORT = 8080/PORT = 8090/' server.py && python server.py &
cd - && TF_URL=http://localhost:8090/index.html node tests/run-all.js
```

Expected: **27 of 32 checks fail on the baseline, 0 fail on HEAD.**

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
