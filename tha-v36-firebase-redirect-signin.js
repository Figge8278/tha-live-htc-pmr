import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

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

  function writeStatus(message) {
    try {
      localStorage.setItem('tha-firebase-auth-status-v1', JSON.stringify({
        state: 'redirecting',
        message,
        updatedAt: new Date().toISOString()
      }));
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
    writeStatus('Redirecting to Google sign-in.');

    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Sign in with Google';
      window.alert(error?.message || 'Google sign-in could not start.');
    }
  }, true);
})();
