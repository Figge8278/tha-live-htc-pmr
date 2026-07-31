import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDgoWclKy-Ly08PcQxY5-R5v8TQ0URMxEQ',
    authDomain: 'tha--app.firebaseapp.com',
    projectId: 'tha--app',
    storageBucket: 'tha--app.firebasestorage.app',
    messagingSenderId: '472188931671',
    appId: '1:472188931671:web:507d0904ea295b74275d12',
    measurementId: 'G-9XK81BQ1NB'
  };

  function writeStatus(message, state = 'signing-in') {
    try {
      const existing = JSON.parse(localStorage.getItem('tha-firebase-auth-status-v1') || '{}');
      localStorage.setItem('tha-firebase-auth-status-v1', JSON.stringify({
        ...existing,
        state,
        message,
        updatedAt: new Date().toISOString()
      }));
      window.dispatchEvent(new Event('tha-firebase-auth-updated'));
    } catch {
      // Status only.
    }
  }

  document.addEventListener('click', async event => {
    const button = event.target?.closest?.('[data-tha-firebase-login]');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    button.disabled = true;
    button.textContent = 'Opening Google sign-in...';
    writeStatus('Opening Google sign-in popup. Choose the approved THA Google account.');

    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      writeStatus('Google sign-in returned. Checking approved user.', 'checking');
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Sign in with Google';
      writeStatus(error?.message || 'Google sign-in popup failed.', 'error');
      window.alert(error?.message || 'Google sign-in popup failed.');
    }
  }, true);
})();