# Getting sign-in emails working

The backend is already running — it starts with the rest of the app. What
this page covers is switching email on, so sign-in links arrive in an inbox
instead of the terminal.

**Nothing here needs installing.** The server is Python standard library
only, and SQLite ships with Python.

---

## It already works without email

Start the app as usual:

```bash
python server.py
```

Click **Sign in**, enter your address, and look at the terminal. The link is
printed there:

```
======================================================================
[TravelFix] Email is not configured (no RESEND_API_KEY).
[TravelFix] Sign-in link for you@example.com:
[TravelFix] http://localhost:8080/api/auth/verify?token=...
======================================================================
```

Paste it into your browser and you are signed in. Everything works — the
account, the session, the cookie — the only missing piece is delivery.

Use this to confirm the flow before touching DNS.

---

## Step 1 — Get a Resend API key

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month,
   100/day, no card).
2. Go to **API Keys** → **Create API Key**. Give it **Sending access** only.
3. Copy the key. It starts `re_` and is shown **once**.

## Step 2 — Create your `.env`

Copy the template:

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```
RESEND_API_KEY=re_your_key_here
```

`.env` is gitignored. Do not commit it, and if you ever paste a key into a
chat or an issue, revoke it in the Resend dashboard and make a new one.

Restart the server. The banner should now read:

```
[TravelFix] Email:      configured (Resend)
```

At this point sign-in emails send — but only to **your own Resend account
address**, from their sandbox sender `onboarding@resend.dev`. That is enough
to see a real email arrive. To mail anyone else, you need your domain.

## Step 3 — Verify your domain

In Resend: **Domains** → **Add Domain**. Enter your domain (or better, a
subdomain such as `mail.yourdomain.com` — keeping app mail on a subdomain
means a deliverability problem there never taints your main domain).

Resend then shows you three records to add at your DNS provider — wherever
you bought the domain. They look roughly like this, but **use the exact
values Resend gives you**, not these:

| Type | Name | Value |
|---|---|---|
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSq...` (a long key) |

Adding them varies by provider but is always the same shape: find **DNS** or
**DNS Records**, click **Add Record**, pick the type, paste the name and
value.

One thing that trips people up: some providers want the name **relative**
(`send`) and some want it **absolute** (`send.yourdomain.com`). If Resend
still shows the record as missing after an hour, try the other form.

DNS propagation usually takes minutes, occasionally up to 48 hours. Resend
shows **Verified** when it sees the records.

### Add DMARC as well

Resend does not require it, but Gmail and Yahoo increasingly do for bulk
senders, and it protects your domain from being spoofed. Add one more TXT
record:

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:you@yourdomain.com` |

`p=none` means "monitor, don't block" — the right place to start. Once
you've seen a few weeks of reports and nothing legitimate is failing, you
can tighten to `p=quarantine`.

## Step 4 — Send from your domain

Update `.env`:

```
MAIL_FROM=TravelFix <hello@yourdomain.com>
```

Restart. Sign-in links now go to any address.

---

## Putting it on the internet

Everything above works on `localhost`. To let other people use it:

1. **Host it.** Fly.io, Railway and Render all run a Python process for
   roughly $5/month. The whole app is one command: `python server.py`.
2. **Set `BASE_URL`** to your real address:
   ```
   BASE_URL=https://travelfix.yourdomain.com
   ```
   This matters more than it looks — magic links are built from it. Leave it
   as `localhost` and you will email people links to their own machines.
3. **Serve over HTTPS.** All three hosts do this for you. The app notices and
   automatically marks the session cookie `Secure` and adds HSTS, because
   `COOKIE_SECURE` is derived from `BASE_URL`.

---

## What you have, and what you do not

**Working:** accounts keyed to a verified email, passwordless sign-in, one-time
links that expire in 15 minutes, sessions in an HttpOnly cookie for 30 days,
rate limiting, and sign-out.

**Not built yet:** travel plans still live in the browser's localStorage, not
in your account. Signing in on another device gives you an empty planner. That
is the next step, and it is the one that makes invites and shared trips
possible — see `BACKEND-SCOPE.md`.

---

## Security notes

Relevant if you are pointing a scanner at this.

**What the server does deliberately:**

- Login tokens and session ids are 32 bytes from a CSPRNG. Only their SHA-256
  is stored, so the tables are not usable as credentials if they leak.
- Consuming a login token is a conditional `UPDATE ... WHERE consumed_at IS
  NULL`, so two simultaneous clicks cannot both succeed.
- Requesting a link returns an identical response whether or not the account
  exists — no enumeration.
- Requesting a new link retires any outstanding one for that account.
- Every SQL statement is parameterised. `server/db.py` never concatenates a
  value into a query.
- Email validation deliberately permits the punctuation RFC 5321 allows,
  including apostrophes. Validation is a usability check; parameterised
  queries are the actual boundary. (An earlier version rejected
  `o'brien@example.com` and looked safer while simply being broken.)
- Session cookies are `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` when
  served over HTTPS.
- State-changing endpoints check `Origin`/`Referer` behind `SameSite`.
- Security headers on every response, including a CSP.
- `.env` and the database are explicitly not servable over HTTP.

**Known limitations, stated rather than hidden:**

- **Rate limiting is in-process.** One Python process enforces it correctly.
  Run several workers and each keeps its own counter, multiplying the real
  limit. Shared storage is needed before this scales.
- **CSP still allows `'unsafe-inline'` for styles**, because the markup uses
  inline `style` attributes throughout. Tightening it means moving those into
  the stylesheet first.
- **No account deletion or data export.** If real people ever use this in the
  EU, GDPR requires both.
- **SQLite with WAL** is fine for one process and modest traffic. Concurrent
  writes across processes need Postgres.
- **No audit log.** Sign-ins are not recorded beyond the session row.
- **Sessions are not rotated** on privilege change, because there are no
  privileges yet.

## Testing it

```bash
python server.py            # terminal 1
python tests/test_auth.py   # terminal 2
```

49 checks covering the happy path plus token replay, expiry, superseded
links, enumeration, injection, CSRF, cookie flags, rate limiting, oversized
bodies, and whether `.env` is reachable over HTTP.

The browser-side flow has its own suite:

```bash
node tests/test-signin.js
```
