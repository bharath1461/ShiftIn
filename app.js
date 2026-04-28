import Router from './router.js';
import AppState from './lib/state.js';
import { initAuth } from './lib/auth.js';
import { getProfile } from './lib/supabase.js';
import { renderSplash, renderRoleSelection, renderEmployeeLogin, renderEmployerLogin, renderEmployeeOnboarding, renderEmployerOnboarding, renderVerification } from './screens-auth.js';
import { renderEmployeeDashboard, renderEmployerDashboard } from './screens-dashboard.js';
import { renderJobDetails, renderApplicationFlow, renderPostJob, renderApplicantManagement, renderProfile } from './screens-features.js';

// Initialize Firebase Auth and load profile if returning user
async function bootstrap() {
  try {
    await initAuth();
    // Wait for auth state to settle (redirect result needs time)
    await new Promise(r => setTimeout(r, 1200));

    const user = AppState.get('user');
    if (user && !AppState.get('profile')) {
      try {
        const profile = await getProfile(user.uid);
        if (profile) {
          AppState.set({ profile, role: profile.role });
          // If user just returned from Google redirect and is on splash/login, route to dashboard
          const hash = window.location.hash;
          if (!hash || hash === '#/' || hash.startsWith('#/login') || hash.startsWith('#/role')) {
            window.location.hash = profile.role === 'employer' ? '#/dashboard/employer' : '#/dashboard/employee';
          }
        } else {
          // User authenticated but no profile — send to onboarding
          const role = AppState.get('role') || 'student';
          const hash = window.location.hash;
          if (!hash || hash === '#/' || hash.startsWith('#/login')) {
            window.location.hash = role === 'employer' ? '#/onboarding/employer' : '#/onboarding/employee';
          }
        }
      } catch (e) {
        console.warn('Profile fetch failed:', e);
      }
    }
  } catch (e) {
    console.warn('Bootstrap error:', e);
  }
}

// Register all routes
Router.register('#/', renderSplash);
Router.register('#/role', renderRoleSelection);
Router.register('#/login/employee', renderEmployeeLogin);
Router.register('#/login/employer', renderEmployerLogin);
Router.register('#/onboarding/employee', renderEmployeeOnboarding);
Router.register('#/onboarding/employer', renderEmployerOnboarding);
Router.register('#/verify', renderVerification);
Router.register('#/dashboard/employee', renderEmployeeDashboard);
Router.register('#/dashboard/employer', renderEmployerDashboard);
Router.register('#/job/:id', renderJobDetails);
Router.register('#/apply/:id', renderApplicationFlow);
Router.register('#/post-job', renderPostJob);
Router.register('#/applicants/:id', renderApplicantManagement);
Router.register('#/profile', renderProfile);

// Boot then start router
bootstrap().then(() => Router.init());

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
