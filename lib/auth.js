// ShiftIn — Firebase Authentication Service
import { FIREBASE_CONFIG } from '../config.js';
import AppState from './state.js';

let app, auth, authMod;
let initialized = false;

async function init() {
  if (initialized) return;
  const appMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  app = appMod.initializeApp(FIREBASE_CONFIG);
  auth = authMod.getAuth(app);
  auth.useDeviceLanguage();
  initialized = true;

  // Check for redirect result first (handles return from Google sign-in)
  try {
    const result = await authMod.getRedirectResult(auth);
    if (result && result.user) {
      const u = result.user;
      AppState.set({ user: { uid: u.uid, email: u.email, phone: u.phoneNumber, displayName: u.displayName, photoURL: u.photoURL } });
    }
  } catch (e) {
    console.warn('Redirect result error:', e.message);
  }

  // Listen for auth state changes
  authMod.onAuthStateChanged(auth, (user) => {
    if (user) {
      AppState.set({ user: { uid: user.uid, email: user.email, phone: user.phoneNumber, displayName: user.displayName, photoURL: user.photoURL } });
    } else {
      AppState.set({ user: null, profile: null });
    }
  });
}

// Google Sign-In — uses redirect (works on all browsers/deployments)
export async function signInWithGoogle() {
  await init();
  const provider = new authMod.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  // Try popup first, fallback to redirect
  try {
    const result = await authMod.signInWithPopup(auth, provider);
    return result.user;
  } catch (e) {
    // If popup blocked or failed, use redirect
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      await authMod.signInWithRedirect(auth, provider);
      return null; // Page will reload after redirect
    }
    throw e;
  }
}

// Phone OTP — Step 1: Send code
let confirmationResult = null;
export async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
  await init();
  if (window._recaptchaVerifier) {
    try { window._recaptchaVerifier.clear(); } catch {}
  }
  window._recaptchaVerifier = new authMod.RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
  confirmationResult = await authMod.signInWithPhoneNumber(auth, phoneNumber, window._recaptchaVerifier);
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
  await authMod.signOut(auth);
  AppState.clear();
}

// Get current user
export function getCurrentUser() {
  return AppState.get('user');
}

export { init as initAuth };
