// ShiftIn — Firebase Authentication Service
import { FIREBASE_CONFIG } from '../config.js';
import AppState from './state.js';

let app, auth;
let initialized = false;

async function init() {
  if (initialized) return;
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  app = initializeApp(FIREBASE_CONFIG);
  auth = authMod.getAuth(app);
  auth.useDeviceLanguage();
  initialized = true;

  // Listen for auth state changes
  authMod.onAuthStateChanged(auth, async (user) => {
    if (user) {
      AppState.set({ user: { uid: user.uid, email: user.email, phone: user.phoneNumber, displayName: user.displayName, photoURL: user.photoURL } });
    } else {
      AppState.set({ user: null, profile: null });
    }
  });
}

// Google Sign-In
export async function signInWithGoogle() {
  await init();
  const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Phone OTP — Step 1: Send code
let confirmationResult = null;
export async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
  await init();
  const { RecaptchaVerifier, signInWithPhoneNumber } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  
  if (!window._recaptchaVerifier) {
    window._recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
  }
  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window._recaptchaVerifier);
  return true;
}

// Phone OTP — Step 2: Verify code
export async function verifyPhoneOTP(code) {
  if (!confirmationResult) throw new Error('Send OTP first');
  const result = await confirmationResult.confirm(code);
  return result.user;
}

// Sign out
export async function signOut() {
  await init();
  const { signOut: fbSignOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  await fbSignOut(auth);
  AppState.clear();
}

// Get current user
export function getCurrentUser() {
  return AppState.get('user');
}

// Wait for auth to be ready
export async function waitForAuth() {
  await init();
  return new Promise((resolve) => {
    const { onAuthStateChanged } = import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js').then(m => {
      const unsub = m.onAuthStateChanged(auth, (user) => { unsub(); resolve(user); });
    });
  });
}

export { init as initAuth };
