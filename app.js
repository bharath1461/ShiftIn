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
    // Wait a moment for auth state to settle
    await new Promise(r => setTimeout(r, 800));
    const user = AppState.get('user');
    if (user && !AppState.get('profile')) {
      try {
        const profile = await getProfile(user.uid);
        if (profile) AppState.set({ profile, role: profile.role });
      } catch {}
    }
  } catch {}
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
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
