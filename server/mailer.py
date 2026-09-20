"""
Sending the sign-in email.

Uses Resend's HTTP API. With no API key configured, the link is printed to
the console instead — the whole flow stays testable before any DNS work,
and nothing ever silently claims to have sent mail it did not send.
"""

import json
import ssl
import urllib.error
import urllib.request

from config import MAIL_ENABLED, MAIL_FROM, RESEND_API_KEY

RESEND_ENDPOINT = 'https://api.resend.com/emails'


def _escape(text):
    """The email body is HTML, so anything interpolated is escaped."""
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'))


def _build_html(link, ttl_minutes):
    safe_link = _escape(link)
    return f"""<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#0b111e;">Sign in to TravelFix</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
        Click the button below to sign in. This link works once and expires in
        {ttl_minutes} minutes.
      </p>
      <a href="{safe_link}"
         style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;
                padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Sign in to TravelFix
      </a>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
        If the button does not work, paste this into your browser:<br>
        <span style="word-break:break-all;">{safe_link}</span>
      </p>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
        If you did not ask to sign in, you can ignore this email — nobody can
        get into your account without this link.
      </p>
    </div>
  </body>
</html>"""


def _build_text(link, ttl_minutes):
    return (
        'Sign in to TravelFix\n\n'
        f'{link}\n\n'
        f'This link works once and expires in {ttl_minutes} minutes.\n'
        'If you did not ask to sign in, you can ignore this email.\n'
    )


def send_login_link(to_email, link, ttl_minutes=15):
    """
    Returns (sent, detail). sent is False when mail is not configured or the
    provider rejected it; detail is for the server log, never for the client.
    """
    if not MAIL_ENABLED:
        print('=' * 70)
        print('[TravelFix] Email is not configured (no RESEND_API_KEY).')
        print(f'[TravelFix] Sign-in link for {to_email}:')
        print(f'[TravelFix] {link}')
        print('[TravelFix] Paste it into your browser to finish signing in.')
        print('=' * 70, flush=True)
        return False, 'mail-disabled'

    payload = json.dumps({
        'from': MAIL_FROM,
        'to': [to_email],
        'subject': 'Your TravelFix sign-in link',
        'html': _build_html(link, ttl_minutes),
        'text': _build_text(link, ttl_minutes),
    }).encode('utf-8')

    request = urllib.request.Request(
        RESEND_ENDPOINT,
        data=payload,
        method='POST',
        headers={
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json',
        },
    )

    try:
        context = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=15, context=context) as response:
            body = response.read().decode('utf-8', 'replace')
            return True, body[:400]
    except urllib.error.HTTPError as err:
        detail = err.read().decode('utf-8', 'replace')[:400]
        print(f'[TravelFix] Resend rejected the message ({err.code}): {detail}', flush=True)
        return False, f'http-{err.code}'
    except Exception as err:  # network down, DNS, TLS
        print(f'[TravelFix] Could not reach the mail provider: {err}', flush=True)
        return False, 'network-error'
