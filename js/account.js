/**
 * Sign-in UI.
 *
 * Passwordless: you give an email address, the server mails a one-time link,
 * clicking it starts a session. There is no password field because there is
 * no password.
 *
 * The session lives in an HttpOnly cookie, which this file deliberately
 * cannot read — that is the point of HttpOnly, and it is why signed-in state
 * is asked for with GET /api/auth/me rather than kept in localStorage.
 */

import { esc } from './escape.js';

export class TravelFixAccount {
  constructor({ onChange } = {}) {
    this.onChange = onChange;
    this.user = null;
    this.mailConfigured = false;

    this.root = document.getElementById('navbar-account-root');
    this.init();
  }

  async init() {
    await this.refresh();
    this.handleReturnFromEmail();
  }

  /** Ask the server who we are. */
  async refresh() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.user = data.user || null;
      this.mailConfigured = !!data.mailConfigured;
    } catch (err) {
      // The static site still works without the API; sign-in simply is not
      // offered rather than the page breaking.
      this.user = null;
      this.apiUnavailable = true;
      console.warn('TravelFixAccount: sign-in API unreachable', err);
    }
    this.render();
    if (this.onChange) this.onChange(this.user);
  }

  /** The verify redirect comes back with ?signin=ok or ?signin=invalid. */
  handleReturnFromEmail() {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('signin');
    if (!state) return;

    params.delete('signin');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : ''));

    if (state === 'ok') {
      this.toast(`Signed in as ${this.user ? this.user.email : 'your account'}`, 'success');
    } else if (state === 'invalid') {
      this.toast('That sign-in link has expired or was already used. Request a new one.', 'error');
    }
  }

  toast(message, type) {
    if (window.travelFixApp && window.travelFixApp.ui) {
      window.travelFixApp.ui.showToast(message, type);
    }
  }

  render() {
    if (!this.root) return;

    if (this.apiUnavailable) {
      this.root.innerHTML = '';
      return;
    }

    if (this.user) {
      const label = this.user.displayName || this.user.email;
      this.root.innerHTML = `
        <button id="btn-account" class="account-btn signed-in" title="${esc(this.user.email)}">
          <span class="account-avatar">${esc(label.charAt(0).toUpperCase())}</span>
          <span class="account-label">${esc(label)}</span>
        </button>`;
      this.root.querySelector('#btn-account').addEventListener('click', () => this.openAccountMenu());
    } else {
      this.root.innerHTML = `
        <button id="btn-account" class="account-btn">
          <span>Sign in</span>
        </button>`;
      this.root.querySelector('#btn-account').addEventListener('click', () => this.openSignInDialog());
    }
  }

  // ------------------------------------------------------------- dialogs

  mountDialog(innerHtml) {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="quick-modal-overlay tf-schedule-overlay">
        <div class="quick-modal-content schedule-dialog account-dialog">${innerHtml}</div>
      </div>`;
    document.body.appendChild(container);

    const close = () => container.remove();
    container.querySelector('.tf-schedule-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('tf-schedule-overlay')) close();
    });
    container.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', close));
    return { container, close };
  }

  openSignInDialog() {
    const { container, close } = this.mountDialog(`
      <h3>Sign in to TravelFix</h3>
      <p>Enter your email and we'll send you a link. No password to remember,
         and nothing to reset when you forget it.</p>

      <form id="signin-form" class="account-form" novalidate>
        <label class="schedule-label" for="signin-email">Email address</label>
        <input type="email" id="signin-email" class="account-input"
               placeholder="you@example.com" autocomplete="email" required>
        <div class="account-error" id="signin-error" hidden></div>

        ${this.mailConfigured ? '' : `
          <p class="account-note">
            Email sending isn't configured on this server yet, so your link
            will be printed in the terminal window running the server instead
            of arriving in your inbox. See <b>docs/BACKEND-SETUP.md</b>.
          </p>`}

        <div class="quick-modal-buttons">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-send-link">Send sign-in link</button>
        </div>
      </form>`);

    const form = container.querySelector('#signin-form');
    const input = container.querySelector('#signin-email');
    const errorBox = container.querySelector('#signin-error');
    const submit = container.querySelector('#btn-send-link');
    setTimeout(() => input.focus(), 50);

    const showError = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.hidden = true;

      const email = input.value.trim();
      if (!email) return showError('Enter your email address.');

      submit.disabled = true;
      submit.textContent = 'Sending…';

      try {
        const res = await fetch('/api/auth/request-link', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 400) {
          submit.disabled = false;
          submit.textContent = 'Send sign-in link';
          return showError(data.message || 'That address does not look right.');
        }
        if (res.status === 429) {
          submit.disabled = false;
          submit.textContent = 'Send sign-in link';
          return showError(data.message || 'Too many attempts. Wait a while and try again.');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        close();
        this.openCheckInboxDialog(email, data.delivery === 'email');
      } catch (err) {
        submit.disabled = false;
        submit.textContent = 'Send sign-in link';
        showError('Could not reach the server. Is it still running?');
        console.warn('TravelFixAccount: sign-in request failed', err);
      }
    });
  }

  openCheckInboxDialog(email, wasEmailed) {
    this.mountDialog(`
      <h3>${wasEmailed ? 'Check your inbox' : 'Check the server console'}</h3>
      ${wasEmailed ? `
        <p>If <b>${esc(email)}</b> can receive mail, a sign-in link is on its
           way. It works once and expires in 15 minutes.</p>
        <p class="account-note">Nothing arrived? Check spam, then try again —
           requesting a new link retires the old one.</p>
      ` : `
        <p>Email isn't configured on this server, so the sign-in link for
           <b>${esc(email)}</b> was printed in the terminal window running
           <code>server.py</code>.</p>
        <p class="account-note">Copy the link from there and paste it into
           your browser. To get real emails instead, follow
           <b>docs/BACKEND-SETUP.md</b>.</p>
      `}
      <div class="quick-modal-buttons">
        <button type="button" class="btn btn-primary" data-close>Got it</button>
      </div>`);
  }

  openAccountMenu() {
    const { container, close } = this.mountDialog(`
      <h3>Your account</h3>
      <p class="account-email-row">
        <b>${esc(this.user.email)}</b>
        ${this.user.emailVerified ? '<span class="account-verified">Verified</span>' : ''}
      </p>
      <p class="account-note">
        Your travel plans are still stored in this browser only — moving them
        to your account is the next step after sign-in.
      </p>
      <div class="quick-modal-buttons">
        <button type="button" class="btn btn-secondary" data-close>Close</button>
        <button type="button" class="btn btn-danger" id="btn-signout">Sign out</button>
      </div>`);

    container.querySelector('#btn-signout').addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      } catch (err) {
        console.warn('TravelFixAccount: logout request failed', err);
      }
      close();
      await this.refresh();
      this.toast('Signed out', 'info');
    });
  }
}
