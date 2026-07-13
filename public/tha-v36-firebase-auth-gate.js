import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

(() => {
  const STYLE_ID = 'tha-v36-firebase-auth-gate-styles';
  const OVERLAY_ID = 'tha-v36-firebase-auth-gate';
  const AUTH_STATUS_KEY = 'tha-firebase-auth-status-v1';
  const AUTH_PROFILE_KEY = 'tha-firebase-auth-profile-v1';
  const SUBMITTED_BY_KEY = 'tha-drive-submitted-by';
  const ROLE_KEY = 'tha-drive-user-role';
  const DESTINATION_KEY = 'tha-drive-upload-destination';
  const MODE_KEY = 'tha-drive-upload-mode';
  const TEMP_BYPASS_KEY = 'tha-firebase-auth-temporary-bypass';

  const firebaseConfig = {
    apiKey: 'AIzaSyDgoWclKy-Ly08PcQxY5-R5v8TQ0URMxEQ',
    authDomain: 'tha--app.firebaseapp.com',
    projectId: 'tha--app',
    storageBucket: 'tha--app.firebasestorage.app',
    messagingSenderId: '472188931671',
    appId: '1:472188931671:web:507d0904ea295b74275d12',
    measurementId: 'G-9XK81BQ1NB'
  };

  const APPROVED_USERS = {
    'office@thehomeowneradvocate.com': {
      name: 'Figge',
      role: 'admin',
      roleLabel: 'Figge / Admin',
      destination: 'incoming'
    }
  };

  let auth;
  let currentState = { state: 'starting', message: 'Preparing Google sign-in.', user: null, profile: null };

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function setStorage(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Field helper only. */ }
  }

  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch { /* Field helper only. */ }
  }

  function readStorage(key) {
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
  }

  function emailKey(email = '') {
    return String(email || '').trim().toLowerCase();
  }

  function isTemporaryBypassActive() {
    return readStorage(TEMP_BYPASS_KEY) === 'true';
  }

  function writeStatus(patch = {}) {
    currentState = { ...currentState, ...patch, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(currentState)); } catch { /* Status only. */ }
    window.dispatchEvent(new Event('tha-firebase-auth-updated'));
  }

  function applyApprovedProfile(user, profile) {
    const submittedBy = profile.name || user.displayName || user.email || 'Approved User';
    const role = profile.role || 'trusted';
    const destination = profile.destination || (role === 'demo' ? 'demo' : 'incoming');
    setStorage(SUBMITTED_BY_KEY, submittedBy);
    setStorage(ROLE_KEY, role);
    setStorage(DESTINATION_KEY, destination);
    setStorage(MODE_KEY, destination);
    try {
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify({
        email: user.email,
        name: submittedBy,
        role,
        roleLabel: profile.roleLabel || role,
        destination,
        approved: true,
        updatedAt: new Date().toISOString()
      }));
    } catch { /* Profile only. */ }
    window.THA_DRIVE_ROOT?.setUploadRouting?.({ mode: destination, submittedBy });
    window.dispatchEvent(new Event('tha-drive-root-updated'));
  }

  function clearApprovedProfile() {
    removeStorage(AUTH_PROFILE_KEY);
  }

  function currentOrigin() {
    return window.location.origin;
  }

  function currentDomain() {
    return window.location.hostname;
  }

  function authHtml() {
    const state = currentState.state;
    const user = currentState.user;
    const profile = currentState.profile;
    const isApproved = state === 'approved';
    const isBlocked = state === 'blocked';
    const bypass = isTemporaryBypassActive();
    const chipClass = isApproved || bypass ? 'good' : isBlocked ? 'bad' : 'warn';
    const chipText = bypass ? 'Temporary bypass active' : isApproved ? 'Approved user' : isBlocked ? 'Not approved yet' : 'Sign-in needed';
    const signedInText = user?.email ? `Signed in as ${escapeHtml(user.email)}` : 'No Google user signed in yet.';
    return `
      <section class="tha-firebase-auth-gate ${isApproved || bypass ? 'approved' : ''}" id="${OVERLAY_ID}" aria-live="polite">
        <div class="tha-auth-card">
          <div class="tha-auth-header">
            <div>
              <h2>THA App Login</h2>
              <p>Sign in with the Google account Figge approved for this app.</p>
            </div>
            <span class="tha-auth-chip ${chipClass}">${chipText}</span>
          </div>

          <div class="tha-auth-status">
            <strong>${signedInText}</strong>
            <span>${escapeHtml(currentState.message || 'Waiting for Google sign-in.')}</span>
          </div>

          ${isApproved ? `
            <div class="tha-auth-approved-box">
              <strong>Access ready</strong>
              <span>Name: ${escapeHtml(profile?.name || user?.displayName || 'Approved User')}</span>
              <span>Role: ${escapeHtml(profile?.roleLabel || profile?.role || 'Approved')}</span>
              <span>Upload lane: ${escapeHtml(profile?.destination || 'incoming')}</span>
            </div>
          ` : `
            <div class="tha-auth-instructions">
              <strong>Field-user flow</strong>
              <ol>
                <li>Sign in with Google.</li>
                <li>The app checks whether that email is approved.</li>
                <li>Approved users get their name and upload lane filled automatically.</li>
                <li>Still click Connect Google Drive before saving a PMR package.</li>
              </ol>
            </div>
          `}

          <div class="tha-auth-actions">
            ${!isApproved ? '<button type="button" class="primary" data-tha-firebase-login>Sign in with Google</button>' : ''}
            ${isApproved ? '<button type="button" class="primary" data-tha-firebase-close>Continue to app</button>' : ''}
            ${user?.email ? '<button type="button" data-tha-firebase-logout>Sign out</button>' : ''}
          </div>

          <details class="tha-auth-admin-help">
            <summary>Admin setup / troubleshooting</summary>
            <div>
              <p><strong>Approved admin seeded:</strong> office@thehomeowneradvocate.com</p>
              <p><strong>Firebase project:</strong> tha--app</p>
              <p><strong>Current app domain:</strong> <code>${escapeHtml(currentDomain())}</code></p>
              <p>If Google blocks sign-in, add this domain to Firebase Authentication authorized domains.</p>
              <button type="button" data-tha-copy-domain>Copy domain</button>
              <button type="button" data-tha-firebase-bypass>${bypass ? 'Turn off temporary bypass' : 'Temporary field-test bypass'}</button>
            </div>
          </details>
        </div>
      </section>
    `;
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-firebase-auth-gate{position:fixed!important;inset:0!important;z-index:2147482000!important;background:rgba(13,31,40,.68)!important;backdrop-filter:blur(5px)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;color:#173e57!important}
      .tha-firebase-auth-gate.approved{background:rgba(13,31,40,.24)!important;pointer-events:auto!important}
      .tha-auth-card{width:min(720px,100%)!important;max-height:92vh!important;overflow:auto!important;border:1px solid #d9e7ed!important;border-radius:24px!important;background:#fff!important;box-shadow:0 22px 70px rgba(0,0,0,.35)!important;padding:18px!important;display:grid!important;gap:14px!important;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
      .tha-auth-header{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:flex-start!important;flex-wrap:wrap!important}
      .tha-auth-header h2{margin:0!important;font-size:22px!important;color:#173e57!important;line-height:1.15!important}
      .tha-auth-header p,.tha-auth-status span,.tha-auth-instructions li,.tha-auth-approved-box span,.tha-auth-admin-help p{margin:0!important;font-size:13px!important;line-height:1.42!important;color:#49616b!important;font-weight:780!important}
      .tha-auth-chip{border:1px solid #d7e3ea!important;border-radius:999px!important;background:#f6fbfd!important;color:#315568!important;padding:7px 10px!important;font-size:12px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-auth-chip.good{border-color:#abd6a3!important;background:#f3fbf0!important;color:#285c30!important}.tha-auth-chip.warn{border-color:#f0bd82!important;background:#fff4e6!important;color:#8a4b08!important}.tha-auth-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}
      .tha-auth-status,.tha-auth-instructions,.tha-auth-approved-box{border:1px solid #d9e7ed!important;border-radius:16px!important;background:#fbfdfe!important;padding:12px!important;display:grid!important;gap:6px!important}
      .tha-auth-approved-box{border-color:#b7d9ae!important;background:#f8fff6!important;color:#285c30!important}.tha-auth-approved-box strong,.tha-auth-status strong,.tha-auth-instructions strong{font-size:14px!important;color:#173e57!important}
      .tha-auth-instructions ol{margin:4px 0 0 20px!important;padding:0!important}.tha-auth-instructions li{margin:3px 0!important}
      .tha-auth-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}.tha-auth-actions button,.tha-auth-admin-help button{border:1px solid #d7e3ea!important;border-radius:999px!important;background:#fff!important;color:#315568!important;padding:10px 13px!important;font-size:13px!important;font-weight:950!important;cursor:pointer!important}.tha-auth-actions button.primary{background:#2378a8!important;border-color:#2378a8!important;color:#fff!important;box-shadow:0 0 0 4px rgba(35,120,168,.16)!important}
      .tha-auth-admin-help{border:1px dashed #cddfea!important;border-radius:16px!important;background:#fff!important;padding:10px 12px!important}.tha-auth-admin-help summary{cursor:pointer!important;font-size:13px!important;font-weight:950!important;color:#315568!important}.tha-auth-admin-help div{display:grid!important;gap:7px!important;margin-top:8px!important}.tha-auth-admin-help code{word-break:break-all!important;background:#eef6fa!important;border:1px solid #d7e7ef!important;border-radius:7px!important;padding:2px 5px!important;color:#244b5c!important}
      @media(max-width:720px){.tha-auth-actions button,.tha-auth-admin-help button{width:100%!important}.tha-firebase-auth-gate{align-items:flex-start!important}}
      @media print{.tha-firebase-auth-gate{display:none!important}}
    `;
    document.head.append(style);
  }

  function render() {
    installStyles();
    const existing = document.getElementById(OVERLAY_ID);
    const bypass = isTemporaryBypassActive();
    if ((currentState.state === 'approved' || bypass) && existing?.dataset.dismissed === 'true') return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = authHtml();
    const next = wrapper.firstElementChild;
    if (existing) existing.replaceWith(next);
    else document.body.append(next);
    wire(next);
  }

  function dismissGate() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.dataset.dismissed = 'true';
      overlay.remove();
    }
  }

  function wire(root) {
    root.querySelector('[data-tha-firebase-login]')?.addEventListener('click', async () => {
      writeStatus({ state: 'signing-in', message: 'Opening Google sign-in.', user: currentState.user || null, profile: currentState.profile || null });
      render();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        if (/popup|blocked|closed/i.test(error?.code || error?.message || '')) {
          await signInWithRedirect(auth, provider);
        } else {
          writeStatus({ state: 'error', message: error?.message || 'Google sign-in failed.', user: currentState.user || null, profile: currentState.profile || null });
          render();
        }
      }
    });

    root.querySelector('[data-tha-firebase-logout]')?.addEventListener('click', async () => {
      removeStorage(TEMP_BYPASS_KEY);
      await signOut(auth).catch(() => null);
      clearApprovedProfile();
      writeStatus({ state: 'signed-out', message: 'Signed out. Sign in with an approved Google account.', user: null, profile: null });
      render();
    });

    root.querySelector('[data-tha-firebase-close]')?.addEventListener('click', dismissGate);

    root.querySelector('[data-tha-copy-domain]')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentDomain());
        window.alert(`Copied domain: ${currentDomain()}`);
      } catch {
        window.prompt('Copy this Firebase authorized domain:', currentDomain());
      }
    });

    root.querySelector('[data-tha-firebase-bypass]')?.addEventListener('click', () => {
      if (isTemporaryBypassActive()) removeStorage(TEMP_BYPASS_KEY);
      else setStorage(TEMP_BYPASS_KEY, 'true');
      writeStatus({ state: isTemporaryBypassActive() ? 'temporary-bypass' : 'signed-out', message: isTemporaryBypassActive() ? 'Temporary field-test bypass is active. Remove this after Firebase approval is confirmed.' : 'Temporary bypass off. Sign in required.', user: currentState.user || null, profile: currentState.profile || null });
      render();
    });
  }

  async function start() {
    installStyles();
    writeStatus({ state: 'starting', message: 'Preparing Google sign-in.', user: null, profile: null });
    render();
    try {
      const app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      await getRedirectResult(auth).catch(() => null);
      onAuthStateChanged(auth, user => {
        if (!user?.email) {
          clearApprovedProfile();
          writeStatus({ state: isTemporaryBypassActive() ? 'temporary-bypass' : 'signed-out', message: isTemporaryBypassActive() ? 'Temporary field-test bypass is active.' : 'Sign in with Google to use the app.', user: null, profile: null });
          render();
          return;
        }
        const key = emailKey(user.email);
        const profile = APPROVED_USERS[key];
        if (!profile) {
          clearApprovedProfile();
          writeStatus({ state: 'blocked', message: 'This Google email is not on the approved app users list yet.', user: { email: user.email, displayName: user.displayName || '' }, profile: null });
          render();
          return;
        }
        applyApprovedProfile(user, profile);
        writeStatus({ state: 'approved', message: 'Approved user. Name and upload lane have been set.', user: { email: user.email, displayName: user.displayName || '' }, profile });
        render();
      });
    } catch (error) {
      writeStatus({ state: 'error', message: error?.message || 'Firebase auth could not start.', user: null, profile: null });
      render();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
