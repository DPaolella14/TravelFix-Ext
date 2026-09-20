# Backend scope: accounts, group chat, email invites

TravelFix is currently a static site. Everything it "remembers" lives in one
browser's `localStorage` — one person, one device, invisible to everyone else.

Three requested features cannot be built on that foundation, because each one
is fundamentally about *two or more people sharing state*:

- **Email registration** — a person proves they own an address and gets an
  account that persists across devices.
- **Group chat** — messages written by one person appear for another.
- **Email invites** — someone who has never opened the site receives a link
  that grants them access to a specific plan.

This document is what those actually require, so the decision to build (or
not) can be made on real numbers rather than a guess.

---

## 1. What has to exist

### Identity and accounts

An account is an email address, a verified flag, and a credential. Three ways
to do the credential, in increasing order of what you have to get right:

| Approach | What you write | What can go wrong on you |
|---|---|---|
| **Managed auth** (Auth0, Clerk, Supabase Auth, Firebase Auth) | Config and a callback route | Vendor lock-in, per-MAU cost |
| **Magic links only** (no passwords) | Token generation, expiry, single-use enforcement | Token leakage via email forwarding, replay |
| **Passwords yourself** | Hashing (argon2/bcrypt), reset flow, rate limiting, breach checks | All of the above, and password reset is the single most commonly broken flow on the web |

Recommendation: **managed auth**, and specifically magic links, because this
app has no reason to store a password. Fewer secrets held means fewer secrets
lost.

Verification matters more than it looks. If an address is not verified before
it can receive plan invites, anyone can type a stranger's email, get them
added to a trip, and send them messages — which is an abuse vector and a
deliverability problem (your domain gets marked as a spam source).

### Database

Roughly this shape:

```
users            id, email (unique, citext), email_verified_at, display_name, created_at
plans            id, owner_id → users, title, start_date, currency, created_at
plan_members     plan_id, user_id, role (owner|editor|viewer), joined_at   [composite PK]
plan_days        id, plan_id, weekday, destination_id, notes
day_items        id, day_id, kind (stay|activity), ref_id, slot_start, slot_end, slot_label
invites          id, plan_id, email, token_hash, role, expires_at, accepted_at, invited_by
messages         id, plan_id, author_id, body, card_json, created_at
message_reads    message_id, user_id, read_at
```

Two things worth noting now rather than later:

- `invites.token_hash`, not `token`. If the table leaks, raw tokens are
  working keys to other people's plans. Store a SHA-256 of the token and
  compare hashes.
- Every query must be scoped by membership. "Show me plan 47" has to mean
  "show me plan 47 *if the caller is a member of it*". This is where most
  small apps leak data — an IDOR where changing a number in a URL returns
  someone else's trip. Postgres row-level security is worth the setup cost
  because it makes the check structural rather than something a developer has
  to remember at every call site.

### Sending mail

A transactional provider — Resend, Postmark, SendGrid, SES. You do not send
mail from your own server; it will land in spam.

Required regardless of provider:

- **SPF, DKIM and DMARC** DNS records on your sending domain. Without these,
  delivery to Gmail and Outlook is unreliable at best.
- A **dedicated sending domain or subdomain** so reputation is yours.
- Bounce and complaint handling, so repeatedly emailing a dead address does
  not damage your sender score.

Cost is not the issue at this scale — all the above have free tiers around
3,000 emails/month. The DNS and reputation work is the real cost, and it is
mostly one-time.

### Realtime transport

For messages to appear without a refresh:

| Option | Fit |
|---|---|
| **Polling** (`GET /messages?since=`) | Fine to start. Trivial. A few seconds of latency. |
| **Server-Sent Events** | One-way server→client, works over plain HTTP, good fit for a chat feed |
| **WebSockets** | Full duplex, what you would want eventually, more infrastructure |
| **Managed** (Supabase Realtime, Pusher, Ably) | Skips the infrastructure question entirely |

Recommendation: **start with polling.** It is honest, it is twenty lines, and
it lets the rest of the system be built and tested. Swap it later; the client
code barely changes.

### Hosting

The static site can stay where it is. The API needs somewhere to run:

- **Serverless** (Vercel Functions, Cloudflare Workers, Netlify Functions) —
  scales to zero, no server to patch, but cold starts and a harder time with
  long-lived WebSocket connections.
- **A small container** (Fly.io, Railway, Render) — simpler mental model,
  always-on, handles WebSockets natively, ~$5–10/month.

Either works. The container is easier to reason about; serverless is cheaper
at zero traffic.

---

## 2. What this costs

### Money

At low volume, near zero:

| Item | Free tier | Beyond it |
|---|---|---|
| Hosting (Fly/Railway/Render) | Limited free | ~$5–10/mo |
| Postgres (Supabase/Neon) | 0.5 GB free | ~$25/mo |
| Email (Resend/Postmark) | ~3k/mo free | ~$10–20/mo |
| Managed auth | ~10k MAU free | Scales with users |
| Domain | — | ~$12/yr |

**Realistically $0/month to start, $20–40/month once any of the free tiers
are outgrown.**

### Time

Rough, assuming the managed-service path:

| Milestone | Estimate |
|---|---|
| Accounts: signup, magic link, verification, session | 1–2 days |
| Database schema, migrations, membership scoping | 1 day |
| Plan sync: replace localStorage with the API | 2–3 days |
| Invites: create, email, accept, expire | 1–2 days |
| Chat: persistence + polling | 1–2 days |
| Hardening: rate limits, RLS, CSRF, audit | 1–2 days |

**Call it 7–12 working days** for something you would be willing to put real
users on. Less if you accept rough edges; more if passwords are rolled by
hand.

---

## 3. The security surface this opens up

Worth reading closely, since this codebase exists to be scanned.

Right now the app's attack surface is almost entirely client-side: the stored
XSS that was fixed in commit `977e445`, and not much else. There is no server,
no session, no database, and no data belonging to anyone but the person at the
keyboard. **A backend changes that category completely.**

New exposure, in rough order of how commonly it goes wrong:

1. **Broken object-level authorisation (IDOR).** `GET /api/plans/47` returning
   a plan the caller is not a member of. The single most common serious flaw
   in apps this size. Mitigation: row-level security, plus a test per endpoint
   that asserts a non-member gets 404.
2. **Invite token weaknesses.** Guessable tokens, tokens that never expire,
   tokens reusable after acceptance, tokens that grant more than the invited
   role. Mitigation: 32 bytes from a CSPRNG, store only the hash, expire in
   7 days, single use, role fixed at creation.
3. **Email enumeration.** A signup or reset endpoint that answers differently
   for known and unknown addresses tells an attacker who has an account.
   Mitigation: identical response and timing either way.
4. **Stored XSS, again, but worse.** Today a chat payload only ever hits the
   author's own browser. With a real backend it reaches *other people*. The
   `esc()` helper in `js/escape.js` handles output encoding; server-side
   validation should be added as defence in depth.
5. **Rate limiting.** Without it: unlimited invite emails from your domain
   (spam, reputation loss), credential stuffing, scraping. Per-IP and
   per-account limits on auth and invite endpoints.
6. **Session handling.** `HttpOnly`, `Secure`, `SameSite=Lax` cookies. If any
   state-changing endpoint accepts a plain form post, CSRF tokens too.
7. **Secrets management.** API keys in environment variables, never in the
   repo. Worth adding a pre-commit secret scan.
8. **Now holding personal data.** Email addresses and travel plans — where
   someone will be and when. That is GDPR-relevant in the EU and carries real
   obligations: deletion on request, breach notification, a lawful basis for
   processing.

### A note on testing Passo

Points 1–8 are exactly the class of finding a scanner should be looking for,
and none of them can be tested against a static site. If the goal is to
exercise Passo properly, a backend is not a distraction from that goal — it is
what makes the more interesting half of the test surface exist at all.

Worth keeping the same discipline used so far: a baseline commit with a known,
documented flaw, and a fixed commit, so scanner output can be checked against
ground truth rather than eyeballed.

---

## 4. Suggested order

Each step is independently useful and leaves the app working:

1. **Accounts only.** Sign up, verify, log in. Plans still in localStorage.
   Proves the auth path end to end with nothing else at risk.
2. **Move plans server-side.** One owner per plan, no sharing yet. This is
   where IDOR protection gets built and tested.
3. **Membership and invites.** Now a plan has more than one person.
4. **Chat.** Persist messages, poll for new ones.
5. **Realtime.** Swap polling for SSE or WebSockets if the latency is
   actually bothering anyone.

Stopping after step 1 or 2 is a perfectly reasonable outcome. Most of the
value of a travel planner is in the planning, and steps 3–5 exist to serve
collaboration specifically.

---

## Current state, for reference

Until any of this is built, the app is honest about what it is:

- `js/chat.js` exports `CHAT_IS_LOCAL_ONLY = true` and seeds nothing.
- `chat.canInvite()` returns `false`, and the invite button explains why
  rather than collecting an address it cannot use.
- The chat empty state says notes stay in this browser.

When the backend lands, `CHAT_IS_LOCAL_ONLY` flips to `false` and the invite
path becomes real. That flag is the seam.
