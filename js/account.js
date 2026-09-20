/**
 * Accounts: sign up, log in, sign out.
 *
 * Two ways in, sharing one dialog:
 *   - email + password (the default)
 *   - a one-time link emailed to you, which also serves as the way back in
 *     when a password has been forgotten
 *
 * The session lives in an HttpOnly cookie, which this file deliberately
 * cannot read — that is the point of HttpOnly, and it is why signed-in state
 * is asked for with GET /api/auth/me rather than kept in localStorage where
 * any injected script could take it.
 */

import { esc } from './escape.js';

export class TravelFixAccount {
  constructor({ onChange } = {}) {
    this.onChange = onChange;
    this.user = null;
    this.mailConfigured = false;
    this.apiUnavailable = false;

    this.root = document.getElementById('navbar-account-root');
    this.init();
  }

  async init() {
    await this.refresh();
    this.handleReturnFromEmail();
  }

  async api(path, { method = 'GET', body } = {}) {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : { 'Accept': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  async refresh() {
    try {
      const { ok, data } = await this.api('/api/auth/me');
      if (!ok) throw new Error('me failed');
      this.user = data.user || null;
      this.mailConfigured = !!data.mailConfigured;
      this.apiUnavailable = false;
    } catch (err) {
      // The static site still works without the API; accounts are simply not
      // offered rather than the page breaking.
      this.user = null;
      this.apiUnavailable = true;
      console.warn('TravelFixAccount: account API unreachable', err);
    }
    this.render();
    if (this.onChange) this.onChange(this.user);
  }

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
      this.toast('That link has expired or was already used. Request a new one.', 'error');
    }
  }

  toast(message, type) {
    if (window.travelFixApp && window.travelFixApp.ui) {
      window.travelFixApp.ui.showToast(message, type);
    }
  }

  // -------------------------------------------------------------- navbar

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
          ${this.user.emailVerified ? '' : '<span class="account-warn-dot" title="Email not verified"></span>'}
        </button>`;
      this.root.querySelector('#btn-account').addEventListener('click', () => this.openAccountMenu());
    } else {
      this.root.innerHTML = `
        <button id="btn-account" class="account-btn account-cta">
          <span class="account-cta-icon">&#128100;</span>
          <span>Log in / Sign up</span>
        </button>`;
      this.root.querySelector('#btn-account').addEventListener('click', () => this.openAuthDialog('login'));
    }
  }

  // -------------------------------------------------------------- dialogs

  mountDialog(innerHtml, extraClass = '') {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="quick-modal-overlay tf-schedule-overlay">
        <div class="quick-modal-content schedule-dialog account-dialog ${extraClass}">${innerHtml}</div>
      </div>`;
    document.body.appendChild(container);

    const close = () => container.remove();
    container.querySelector('.tf-schedule-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('tf-schedule-overlay')) close();
    });
    container.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', close));
    return { container, close };
  }

  /** mode: 'login' | 'signup' */
  openAuthDialog(mode = 'login', prefillEmail = '') {
    const isSignup = mode === 'signup';

    const { container, close } = this.mountDialog(`
      <div class="auth-tabs" role="tablist">
        <button type="button" class="auth-tab ${!isSignup ? 'active' : ''}" data-mode="login" role="tab">Log in</button>
        <button type="button" class="auth-tab ${isSignup ? 'active' : ''}" data-mode="signup" role="tab">Sign up</button>
      </div>

      <h3 class="auth-heading">${isSignup ? 'Create your account' : 'Welcome back'}</h3>
      <p class="auth-sub">${isSignup
        ? 'Your travel plans, saved to an account instead of one browser.'
        : 'Sign in with the email and password you signed up with.'}</p>

      <form id="auth-form" class="account-form" novalidate>
        <label class="schedule-label" for="auth-email">Email address</label>
        <input type="email" id="auth-email" class="account-input" autocomplete="email"
               placeholder="you@example.com" value="${esc(prefillEmail)}" required>

        <label class="schedule-label" for="auth-password">Password</label>
        <div class="password-wrap">
          <input type="password" id="auth-password" class="account-input"
                 autocomplete="${isSignup ? 'new-password' : 'current-password'}"
                 placeholder="${isSignup ? 'At least 10 characters' : 'Your password'}" required>
          <button type="button" class="password-reveal" id="btn-reveal" aria-label="Show password">Show</button>
        </div>
        ${isSignup ? '<div class="password-hint">Length beats complexity. A short phrase you will remember is stronger than a scrambled word.</div>' : ''}

        <div class="account-error" id="auth-error" hidden></div>

        <div class="quick-modal-buttons auth-buttons">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-auth-submit">
            ${isSignup ? 'Create account' : 'Log in'}
          </button>
        </div>
      </form>

      <div class="auth-divider"><span>or</span></div>

      <button type="button" class="btn btn-outline btn-block" id="btn-magic-link">
        Email me a one-time link instead
      </button>
      ${isSignup ? '' : '<p class="auth-forgot">Forgotten your password? The emailed link signs you in without one.</p>'}
    `, 'auth-dialog');

    const form = container.querySelector('#auth-form');
    const emailInput = container.querySelector('#auth-email');
    const passwordInput = container.querySelector('#auth-password');
    const errorBox = container.querySelector('#auth-error');
    const submit = container.querySelector('#btn-auth-submit');

    setTimeout(() => (prefillEmail ? passwordInput : emailInput).focus(), 50);

    const showError = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
    };

    container.querySelector('#btn-reveal').addEventListener('click', (e) => {
      const showing = passwordInput.type === 'text';
      passwordInput.type = showing ? 'password' : 'text';
      e.target.textContent = showing ? 'Show' : 'Hide';
    });

    container.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const next = tab.dataset.mode;
        if (next === mode) return;
        close();
        this.openAuthDialog(next, emailInput.value.trim());
      });
    });

    container.querySelector('#btn-magic-link').addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email) {
        emailInput.focus();
        return showError('Enter your email address first.');
      }
      close();
      await this.requestMagicLink(email);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.hidden = true;

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email) return showError('Enter your email address.');
      if (!password) return showError('Enter your password.');

      submit.disabled = true;
      submit.textContent = isSignup ? 'Creating…' : 'Logging in…';

      const restore = () => {
        submit.disabled = false;
        submit.textContent = isSignup ? 'Create account' : 'Log in';
      };

      try {
        const { status, ok, data } = await this.api(
          isSignup ? '/api/auth/signup' : '/api/auth/login',
          { method: 'POST', body: { email, password } }
        );

        if (status === 409) {
          restore();
          return showError(data.message || 'That email already has an account.');
        }
        if (!ok) {
          restore();
          return showError(data.message || 'Something went wrong. Try again.');
        }

        close();
        await this.refresh();
        this.toast(isSignup ? `Account created for ${email}` : `Logged in as ${email}`, 'success');

        if (isSignup && data.verification === 'console') {
          this.openVerifyNoticeDialog(email, false);
        } else if (isSignup) {
          this.openVerifyNoticeDialog(email, true);
        }
      } catch (err) {
        restore();
        showError('Could not reach the server. Is it still running?');
        console.warn('TravelFixAccount: auth request failed', err);
      }
    });
  }

  async requestMagicLink(email) {
    try {
      const { status, ok, data } = await this.api('/api/auth/request-link', {
        method: 'POST', body: { email }
      });
      if (status === 400 || status === 429) {
        this.toast(data.message || 'Could not send a link.', 'error');
        return;
      }
      if (!ok) throw new Error(`HTTP ${status}`);
      this.openLinkSentDialog(email, data.delivery === 'email');
    } catch (err) {
      this.toast('Could not reach the server.', 'error');
      console.warn('TravelFixAccount: link request failed', err);
    }
  }

  openLinkSentDialog(email, wasEmailed) {
    this.mountDialog(`
      <h3>${wasEmailed ? 'Check your inbox' : 'Check the server console'}</h3>
      ${wasEmailed ? `
        <p>If <b>${esc(email)}</b> can receive mail, a one-time link is on its
           way. It works once and expires in 15 minutes.</p>
        <p class="account-note">Nothing arrived? Check spam, then try again —
           requesting a new link retires the old one.</p>
      ` : `
        <p>Email isn't configured on this server, so the link for
           <b>${esc(email)}</b> was printed in the terminal window running
           <code>server.py</code>.</p>
        <p class="account-note">Copy it from there and paste it into your
           browser. To get real emails, follow
           <b>docs/BACKEND-SETUP.md</b>.</p>
      `}
      <div class="quick-modal-buttons">
        <button type="button" class="btn btn-primary" data-close>Got it</button>
      </div>`);
  }

  openVerifyNoticeDialog(email, wasEmailed) {
    this.mountDialog(`
      <h3>You're signed in</h3>
      <p>Your account is ready. We also sent a link to confirm
         <b>${esc(email)}</b> is yours.</p>
      ${wasEmailed ? `
        <p class="account-note">Click it when you get a moment. Until then your
           account works, it just shows as unverified.</p>
      ` : `
        <p class="account-note">Email isn't configured on this server, so that
           confirmation link was printed in the terminal running
           <code>server.py</code>. Your account works either way.</p>
      `}
      <div class="quick-modal-buttons">
        <button type="button" class="btn btn-primary" data-close>Start planning</button>
      </div>`);
  }

  openAccountMenu() {
    const { container, close } = this.mountDialog(`
      <h3>Your account</h3>
      <p class="account-email-row">
        <b>${esc(this.user.email)}</b>
        ${this.user.emailVerified
          ? '<span class="account-verified">Verified</span>'
          : '<span class="account-unverified">Not verified</span>'}
      </p>
      ${this.user.emailVerified ? '' : `
        <p class="account-note">We sent a link to confirm this address. You can
           request another one below.</p>`}
      <p class="account-note">
        Your travel plans are still stored in this browser only — moving them
        into your account is the next step.
      </p>
      <div class="account-menu-actions">
        <button type="button" class="btn btn-outline btn-sm" id="btn-change-password">
          ${this.user.hasPassword ? 'Change password' : 'Set a password'}
        </button>
        ${this.user.emailVerified ? '' : `
          <button type="button" class="btn btn-outline btn-sm" id="btn-resend-verify">
            Resend verification
          </button>`}
      </div>
      <div class="quick-modal-buttons">
        <button type="button" class="btn btn-secondary" data-close>Close</button>
        <button type="button" class="btn btn-danger" id="btn-signout">Sign out</button>
      </div>`);

    container.querySelector('#btn-signout').addEventListener('click', async () => {
      try {
        await this.api('/api/auth/logout', { method: 'POST', body: {} });
      } catch (err) {
        console.warn('TravelFixAccount: logout failed', err);
      }
      close();
      await this.refresh();
      this.toast('Signed out', 'info');
    });

    container.querySelector('#btn-change-password').addEventListener('click', () => {
      close();
      this.openChangePasswordDialog();
    });

    const resend = container.querySelector('#btn-resend-verify');
    if (resend) {
      resend.addEventListener('click', async () => {
        close();
        await this.requestMagicLink(this.user.email);
      });
    }
  }

  openChangePasswordDialog() {
    const hasPassword = !!this.user.hasPassword;

    const { container, close } = this.mountDialog(`
      <h3>${hasPassword ? 'Change password' : 'Set a password'}</h3>
      <p>${hasPassword
        ? 'Changing it signs you out everywhere else.'
        : 'You signed in with an emailed link. Setting a password gives you a second way in.'}</p>

      <form id="pw-form" class="account-form" novalidate>
        ${hasPassword ? `
          <label class="schedule-label" for="pw-current">Current password</label>
          <input type="password" id="pw-current" class="account-input"
                 autocomplete="current-password" required>
        ` : ''}

        <label class="schedule-label" for="pw-new">New password</label>
        <input type="password" id="pw-new" class="account-input"
               autocomplete="new-password" placeholder="At least 10 characters" required>

        <div class="account-error" id="pw-error" hidden></div>

        <div class="quick-modal-buttons">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-pw-submit">
            ${hasPassword ? 'Change password' : 'Set password'}
          </button>
        </div>
      </form>`);

    const form = container.querySelector('#pw-form');
    const errorBox = container.querySelector('#pw-error');
    const submit = container.querySelector('#btn-pw-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.hidden = true;

      const body = { password: container.querySelector('#pw-new').value };
      if (hasPassword) body.currentPassword = container.querySelector('#pw-current').value;

      submit.disabled = true;
      submit.textContent = 'Saving…';

      try {
        const { ok, data } = await this.api('/api/auth/set-password', { method: 'POST', body });
        if (!ok) {
          submit.disabled = false;
          submit.textContent = hasPassword ? 'Change password' : 'Set password';
          errorBox.textContent = data.message || 'Could not update your password.';
          errorBox.hidden = false;
          return;
        }
        close();
        await this.refresh();
        this.toast(data.message || 'Password updated.', 'success');
      } catch (err) {
        submit.disabled = false;
        submit.textContent = hasPassword ? 'Change password' : 'Set password';
        errorBox.textContent = 'Could not reach the server.';
        errorBox.hidden = false;
        console.warn('TravelFixAccount: password change failed', err);
      }
    });
  }
}
