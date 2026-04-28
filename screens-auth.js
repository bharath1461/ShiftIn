import { signInWithGoogle, sendPhoneOTP, verifyPhoneOTP } from './lib/auth.js';
import { getProfile, createProfile } from './lib/supabase.js';
import { showToast, showLoader } from './lib/ui.js';
import AppState from './lib/state.js';

export function renderSplash(el) {
  el.innerHTML = `<main class="page" style="justify-content:space-between;align-items:center;padding:64px 20px;position:relative;overflow:hidden"><div class="blob blob-primary" style="width:400px;height:400px;top:-10%;right:-10%"></div><div></div><div class="flex flex-col items-center text-center gap-lg animate-scale"><div class="splash-icon-wrap"><div class="splash-icon-bg1"></div><div class="splash-icon-bg2"></div><div class="splash-icon"><span class="material-symbols-outlined icon-filled" style="font-size:40px">insights</span></div><div class="splash-dot1"></div><div class="splash-dot2"></div></div><div><h1 class="text-h1 text-primary-container">ShiftIn</h1><p class="text-body-lg text-on-surface-variant" style="max-width:280px;margin:12px auto 0">The Part-Time Career Hub for Students</p></div></div><div class="flex flex-col items-center gap-lg w-full" style="max-width:320px"><div class="splash-progress"><div class="splash-progress-bar"></div></div><div class="flex items-center gap-sm" style="opacity:0.6"><span class="material-symbols-outlined icon-filled" style="font-size:14px">verified_user</span><span class="text-label-sm uppercase tracking-wider text-outline">Verified Opportunities</span></div></div></main>`;
  const user = AppState.get('user');
  const profile = AppState.get('profile');
  setTimeout(() => {
    if (user && profile) location.hash = profile.role === 'employer' ? '#/dashboard/employer' : '#/dashboard/employee';
    else location.hash = '#/role';
  }, 2500);
}

export function renderRoleSelection(el) {
  el.innerHTML = `<header class="top-bar" style="justify-content:center"><span class="top-bar-brand">ShiftIn</span></header><main class="page-content animate-fade" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:40px"><div class="text-center mb-lg" style="max-width:480px"><h1 class="text-h1 mb-sm">How would you like to use ShiftIn?</h1><p class="text-body-md text-on-surface-variant">Choose your role to get started.</p></div><div style="display:grid;gap:24px;width:100%;max-width:900px"><button class="role-card" onclick="location.hash='#/login/employee'" id="role-student"><div class="role-card-bg"><span class="material-symbols-outlined" style="font-size:120px">school</span></div><div class="role-icon" style="background:rgba(0,82,204,0.1);color:var(--primary-container)"><span class="material-symbols-outlined" style="font-size:32px">school</span></div><h2 class="text-h2 mb-sm">I am a Student</h2><p class="text-body-md text-on-surface-variant" style="margin-bottom:32px">Find internships and manage applications.</p><div class="flex items-center gap-sm text-primary-container text-button">Get Started <span class="material-symbols-outlined" style="font-size:20px">arrow_forward</span></div><div class="role-tags"><span class="chip chip-tag">Jobs & Internships</span><span class="chip chip-tag">Career Tracking</span></div></button><button class="role-card" onclick="location.hash='#/login/employer'" id="role-employer"><div class="role-card-bg"><span class="material-symbols-outlined" style="font-size:120px">corporate_fare</span></div><div class="role-icon" style="background:rgba(111,247,238,0.2);color:var(--secondary)"><span class="material-symbols-outlined" style="font-size:32px">corporate_fare</span></div><h2 class="text-h2 mb-sm">I am an Employer</h2><p class="text-body-md text-on-surface-variant" style="margin-bottom:32px">Post jobs and build a talent pipeline.</p><div class="flex items-center gap-sm text-secondary text-button">Hire Talent <span class="material-symbols-outlined" style="font-size:20px">arrow_forward</span></div><div class="role-tags"><span class="chip" style="background:rgba(111,247,238,0.2);color:var(--on-secondary-container)">Candidate Management</span></div></button></div><p class="text-body-sm text-on-surface-variant mt-lg">Already have an account? <a href="#/login/employee" class="text-primary-container text-label-md" style="text-decoration:underline">Log in here</a></p></main>`;
}

async function handleGoogleAuth(role) {
  try {
    const user = await signInWithGoogle();
    const existing = await getProfile(user.uid);
    if (existing) {
      AppState.set({ profile: existing, role: existing.role });
      location.hash = existing.role === 'employer' ? '#/dashboard/employer' : '#/dashboard/employee';
    } else {
      AppState.set({ role });
      location.hash = role === 'employer' ? '#/onboarding/employer' : '#/onboarding/employee';
    }
  } catch (e) { showToast(e.message || 'Auth failed', 'error'); }
}

export function renderEmployeeLogin(el) {
  el.innerHTML = `<header class="top-bar"><div class="flex items-center gap-sm"><span class="top-bar-brand">ShiftIn</span></div></header><main class="page-content animate-fade" style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="width:100%;max-width:440px"><div class="text-center" style="margin-bottom:40px"><h1 class="text-h1 mb-sm">Student Login</h1><p class="text-body-md text-on-surface-variant">Step into your future career today.</p></div><div class="login-card mb-lg"><div class="flex flex-col gap-md" style="margin-bottom:24px"><button class="btn-secondary" id="btn-google"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style="width:20px;height:20px">Sign in with Google</button><button class="btn-secondary" id="btn-phone"><span class="material-symbols-outlined" style="color:var(--primary-container)">phone_android</span>Mobile OTP Login</button></div><div id="phone-section" style="display:none"><div class="mb-md"><label class="input-label">Phone Number</label><input class="input-field" type="tel" placeholder="+91 98765 43210" id="phone-input"></div><div class="mb-md" id="otp-section" style="display:none"><label class="input-label">Enter OTP</label><input class="input-field" type="text" placeholder="123456" id="otp-input" maxlength="6"></div><button class="btn-primary mb-md" id="btn-send-otp">Send OTP</button><div id="recaptcha-container"></div></div><div class="divider-text"><span>or email</span></div><form id="email-form" style="display:flex;flex-direction:column;gap:24px"><div><label class="input-label">University Email</label><input class="input-field" type="email" placeholder="name@university.edu" id="email-input"></div><div><label class="input-label">Password</label><input class="input-field" type="password" placeholder="••••••••" id="pass-input"></div><button class="btn-primary" type="submit" id="btn-signin">Sign In</button></form></div><div class="text-center"><p class="text-body-sm text-on-surface-variant mb-md">New to ShiftIn? <a href="#/onboarding/employee" class="text-primary-container" style="font-weight:600">Create an account</a></p><div style="padding-top:16px;border-top:1px solid rgba(195,198,214,0.2)"><a href="#/login/employer" class="flex items-center justify-center gap-sm text-label-md text-secondary"><span class="material-symbols-outlined" style="font-size:18px">business</span>Switch to Employer Login</a></div></div></div></main>`;
  document.getElementById('btn-google').onclick = () => handleGoogleAuth('student');
  document.getElementById('btn-phone').onclick = () => { document.getElementById('phone-section').style.display = 'block'; };
  document.getElementById('btn-send-otp').onclick = async () => {
    const phone = document.getElementById('phone-input').value.trim();
    if (!phone) return showToast('Enter phone number', 'warning');
    try {
      await sendPhoneOTP(phone, 'recaptcha-container');
      document.getElementById('otp-section').style.display = 'block';
      document.getElementById('btn-send-otp').textContent = 'Verify OTP';
      document.getElementById('btn-send-otp').onclick = async () => {
        try {
          const user = await verifyPhoneOTP(document.getElementById('otp-input').value);
          const existing = await getProfile(user.uid);
          if (existing) { AppState.set({ profile: existing, role: existing.role }); location.hash = '#/dashboard/employee'; }
          else { AppState.set({ role: 'student' }); location.hash = '#/onboarding/employee'; }
        } catch (e) { showToast('Invalid OTP', 'error'); }
      };
      showToast('OTP sent!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };
}

export function renderEmployerLogin(el) {
  el.innerHTML = `<header class="top-bar"><span class="top-bar-brand">ShiftIn</span></header><main class="page-content animate-fade" style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="width:100%;max-width:440px"><div class="card card-elevated" style="margin-bottom:24px"><div class="mb-lg"><h2 class="text-h2">Employer Login</h2><p class="text-body-sm text-on-surface-variant">Manage your job listings and applications.</p></div><div class="flex flex-col gap-md"><button class="btn-secondary" id="btn-google-emp"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style="width:20px;height:20px">Continue with Google</button><div class="divider-text"><span>OR LOGIN WITH OTP</span></div><div class="mb-md"><label class="input-label">Mobile Number</label><input class="input-field" type="tel" placeholder="+91 98765 43210" id="phone-input"></div><div class="mb-md" id="otp-section" style="display:none"><label class="input-label">Enter OTP</label><input class="input-field" type="text" placeholder="123456" id="otp-input" maxlength="6"></div><button class="btn-primary" id="btn-get-otp">Get OTP</button><div id="recaptcha-container"></div><div style="padding-top:24px;text-align:center"><p class="text-body-sm text-on-surface-variant">Looking for work?</p><a href="#/login/employee" class="text-label-md text-secondary">Switch to Student Login</a></div></div></div><div class="flex justify-center gap-lg" style="opacity:0.6"><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-outline" style="font-size:18px">lock</span><span class="text-label-sm text-outline uppercase tracking-wider">Secure SSL</span></div><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-outline" style="font-size:18px">verified</span><span class="text-label-sm text-outline uppercase tracking-wider">ISO Certified</span></div></div></div></main>`;
  document.getElementById('btn-google-emp').onclick = () => handleGoogleAuth('employer');
  document.getElementById('btn-get-otp').onclick = async () => {
    const phone = document.getElementById('phone-input').value.trim();
    if (!phone) return showToast('Enter phone number', 'warning');
    try {
      await sendPhoneOTP(phone, 'recaptcha-container');
      document.getElementById('otp-section').style.display = 'block';
      document.getElementById('btn-get-otp').textContent = 'Verify OTP';
      document.getElementById('btn-get-otp').onclick = async () => {
        try {
          const user = await verifyPhoneOTP(document.getElementById('otp-input').value);
          const existing = await getProfile(user.uid);
          if (existing) { AppState.set({ profile: existing, role: existing.role }); location.hash = '#/dashboard/employer'; }
          else { AppState.set({ role: 'employer' }); location.hash = '#/onboarding/employer'; }
        } catch (e) { showToast('Invalid OTP', 'error'); }
      };
      showToast('OTP sent!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };
}

export function renderEmployeeOnboarding(el) {
  const user = AppState.get('user') || {};
  el.innerHTML = `<header class="top-bar"><div class="flex items-center gap-sm"><a href="#/login/employee" class="back-btn"><span class="material-symbols-outlined">arrow_back</span></a><span class="top-bar-brand">ShiftIn</span></div></header><main class="page-content animate-fade"><div class="mb-lg"><h1 class="text-h1 mb-sm">Let's get you set up</h1><p class="text-body-md text-on-surface-variant">Complete your profile to start matching.</p></div><div class="progress-steps"><div class="progress-step active"></div><div class="progress-step active"></div><div class="progress-step"></div></div><form id="onboard-form" style="display:flex;flex-direction:column;gap:24px"><div class="card"><div class="flex flex-col gap-md"><div><label class="input-label">Full Name</label><input class="input-field" id="name" value="${user.displayName||''}" required></div><div class="grid-2"><div><label class="input-label">College / University</label><input class="input-field" id="college" required></div><div><label class="input-label">Course of Study</label><input class="input-field" id="course" required></div></div><div><label class="input-label">Current Semester</label><select class="input-field" id="semester"><option value="Sem 1">Sem 1</option><option value="Sem 2">Sem 2</option><option value="Sem 3">Sem 3</option><option value="Sem 4+">Sem 4+</option></select></div></div></div><div class="card"><h3 class="text-h3 mb-md">Experience & Preference</h3><div class="flex flex-col gap-md"><div><label class="input-label">Skills (comma separated)</label><input class="input-field" id="skills" placeholder="React, Python, Customer Service"></div><div><label class="input-label">Preferred Work Location</label><input class="input-field" id="location" placeholder="City or campus area"></div><div><label class="input-label">Availability</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label style="display:flex;align-items:center;gap:8px;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer"><input type="checkbox" value="Weekday Mornings" class="avail-check" style="accent-color:var(--primary-container);width:18px;height:18px"><span class="text-label-md">Weekday Mornings</span></label><label style="display:flex;align-items:center;gap:8px;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer"><input type="checkbox" value="Weekday Evenings" class="avail-check" style="accent-color:var(--primary-container);width:18px;height:18px"><span class="text-label-md">Weekday Evenings</span></label><label style="display:flex;align-items:center;gap:8px;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer"><input type="checkbox" value="Weekends" class="avail-check" style="accent-color:var(--primary-container);width:18px;height:18px"><span class="text-label-md">Weekends Full</span></label><label style="display:flex;align-items:center;gap:8px;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer"><input type="checkbox" value="Flexible" class="avail-check" style="accent-color:var(--primary-container);width:18px;height:18px"><span class="text-label-md">Flexible / On-call</span></label></div></div></div></div><button class="btn-primary" type="submit">Proceed to Verification</button></form></main>`;
  document.getElementById('onboard-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = AppState.get('user');
    if (!user) return showToast('Please sign in first', 'error');
    const skills = document.getElementById('skills').value.split(',').map(s=>s.trim()).filter(Boolean);
    const avail = [...document.querySelectorAll('.avail-check:checked')].map(c=>c.value);
    try {
      await createProfile({ firebase_uid: user.uid, role: 'student', email: user.email, phone: user.phone, full_name: document.getElementById('name').value, avatar_url: user.photoURL, college: document.getElementById('college').value, course: document.getElementById('course').value, semester: document.getElementById('semester').value, skills, preferred_location: document.getElementById('location').value, availability: avail });
      showToast('Profile created!', 'success');
      location.hash = '#/verify';
    } catch (e) { showToast(e.message, 'error'); }
  };
}

export function renderEmployerOnboarding(el) {
  const user = AppState.get('user') || {};
  el.innerHTML = `<header class="top-bar"><span class="top-bar-brand">ShiftIn</span></header><main class="page-content animate-fade" style="padding-top:40px"><div class="mb-lg text-center"><h1 class="text-h1">Grow your team with <span class="text-primary-container">ShiftIn</span></h1></div><form id="onboard-form" class="card" style="display:flex;flex-direction:column;gap:24px;max-width:600px;margin:0 auto"><div><label class="input-label">Company Name</label><input class="input-field" id="company" required></div><div class="grid-2"><div><label class="input-label">Business Type</label><select class="input-field" id="biz-type"><option value="" disabled selected>Select</option><option>Technology</option><option>Finance</option><option>Healthcare</option><option>Retail</option><option>Other</option></select></div><div><label class="input-label">Location</label><input class="input-field" id="location" placeholder="City, Country"></div></div><div><label class="input-label">Contact Person</label><input class="input-field" id="contact" value="${user.displayName||''}"></div><button class="btn-primary" type="submit">Complete Onboarding</button></form></main>`;
  document.getElementById('onboard-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = AppState.get('user');
    if (!user) return showToast('Please sign in first', 'error');
    try {
      await createProfile({ firebase_uid: user.uid, role: 'employer', email: user.email, phone: user.phone, full_name: user.displayName || document.getElementById('contact').value, avatar_url: user.photoURL, company_name: document.getElementById('company').value, business_type: document.getElementById('biz-type').value, company_location: document.getElementById('location').value, contact_person: document.getElementById('contact').value });
      showToast('Company profile created!', 'success');
      location.hash = '#/verify';
    } catch (e) { showToast(e.message, 'error'); }
  };
}

export function renderVerification(el) {
  el.innerHTML = `<header class="top-bar"><div class="flex items-center gap-sm"><a href="#/role" class="back-btn"><span class="material-symbols-outlined">arrow_back</span></a><span class="top-bar-brand">Verify your Identity</span></div></header><main class="page-content animate-fade"><div class="mb-lg"><h1 class="text-h1 mb-sm">Secure Verification</h1><p class="text-body-md text-on-surface-variant">Upload your ID document and take a selfie for AI verification.</p></div><div class="flex flex-col gap-md"><div class="card"><h3 class="text-h3 mb-md">Identity Document</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><label class="upload-zone" for="doc-front" id="front-zone"><span class="material-symbols-outlined text-on-surface-variant">add_a_photo</span><span class="text-label-sm text-on-surface-variant">Front Side</span><input type="file" id="doc-front" accept="image/*" style="display:none"></label><label class="upload-zone" for="doc-back" id="back-zone"><span class="material-symbols-outlined text-on-surface-variant">add_a_photo</span><span class="text-label-sm text-on-surface-variant">Back Side</span><input type="file" id="doc-back" accept="image/*" style="display:none"></label></div></div><div class="card"><h3 class="text-h3 mb-md">Selfie Verification</h3><label class="upload-zone" for="selfie-input" id="selfie-zone" style="aspect-ratio:auto;min-height:120px"><span class="material-symbols-outlined text-on-surface-variant">face</span><span class="text-label-sm text-on-surface-variant">Take a selfie or upload</span><input type="file" id="selfie-input" accept="image/*" capture="user" style="display:none"></label></div><div id="verify-result" style="display:none"></div><button class="btn-primary" id="btn-verify" disabled>Upload Documents First</button><button class="btn-outline mt-md" id="btn-skip" style="text-align:center;width:100%">Skip for now</button></div></main>`;
  let frontFile=null, backFile=null, selfieFile=null;
  const updateBtn = () => {
    const btn = document.getElementById('btn-verify');
    if (frontFile) { btn.disabled = false; btn.textContent = 'Verify with AI'; }
  };
  document.getElementById('doc-front').onchange = (e) => { frontFile=e.target.files[0]; if(frontFile){document.getElementById('front-zone').innerHTML=`<span class="material-symbols-outlined text-secondary">check_circle</span><span class="text-label-sm text-secondary">${frontFile.name}</span>`;updateBtn();} };
  document.getElementById('doc-back').onchange = (e) => { backFile=e.target.files[0]; if(backFile) document.getElementById('back-zone').innerHTML=`<span class="material-symbols-outlined text-secondary">check_circle</span><span class="text-label-sm text-secondary">${backFile.name}</span>`; };
  document.getElementById('selfie-input').onchange = (e) => { selfieFile=e.target.files[0]; if(selfieFile) document.getElementById('selfie-zone').innerHTML=`<span class="material-symbols-outlined text-secondary">check_circle</span><span class="text-label-sm text-secondary">${selfieFile.name}</span>`; };
  document.getElementById('btn-skip').onclick = () => { location.hash = AppState.get('role') === 'employer' ? '#/dashboard/employer' : '#/dashboard/employee'; };
  document.getElementById('btn-verify').onclick = async () => {
    if (!frontFile) return;
    const btn = document.getElementById('btn-verify');
    btn.disabled = true; btn.innerHTML = '<span style="display:inline-block;width:20px;height:20px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></span> Analyzing...';
    const resultDiv = document.getElementById('verify-result');
    try {
      const { analyzeDocument, verifySelfie } = await import('./lib/groq.js');
      const { createVerification, updateProfile, uploadFile } = await import('./lib/supabase.js');
      const profile = AppState.get('profile');
      // Upload files
      const frontUrl = await uploadFile('documents', `${profile.id}/front.jpg`, frontFile);
      let backUrl = null; if (backFile) backUrl = await uploadFile('documents', `${profile.id}/back.jpg`, backFile);
      let selfieUrl = null; if (selfieFile) selfieUrl = await uploadFile('documents', `${profile.id}/selfie.jpg`, selfieFile);
      // AI Analysis
      const docResult = await analyzeDocument(frontFile, backFile);
      let selfieResult = null;
      if (selfieFile && frontFile) selfieResult = await verifySelfie(selfieFile, frontFile);
      const status = docResult.verification_status === 'verified' ? 'verified' : 'under_review';
      // Save to DB
      await createVerification({ profile_id: profile.id, document_type: docResult.document_type || 'unknown', document_front_url: frontUrl, document_back_url: backUrl, selfie_url: selfieUrl, ai_result: { document: docResult, selfie: selfieResult }, status });
      await updateProfile(profile.id, { verification_status: status, verification_result: docResult });
      resultDiv.style.display = 'block';
      const isVerified = status === 'verified';
      resultDiv.innerHTML = `<div class="card" style="border:2px solid ${isVerified?'var(--secondary)':'var(--tertiary-container)'}"><div class="flex items-center gap-md mb-md"><span class="material-symbols-outlined icon-filled" style="font-size:32px;color:${isVerified?'var(--secondary)':'var(--tertiary-container)'}">${isVerified?'verified':'pending'}</span><div><h3 class="text-h3">${isVerified?'Verified!':'Under Review'}</h3><p class="text-body-sm text-on-surface-variant">${docResult.reason||'Processing complete'}</p></div></div><div class="flex flex-col gap-sm"><p class="text-body-sm"><strong>Document:</strong> ${docResult.document_type||'N/A'}</p><p class="text-body-sm"><strong>Name:</strong> ${docResult.extracted_name||'N/A'}</p><p class="text-body-sm"><strong>Confidence:</strong> ${Math.round((docResult.confidence_score||0)*100)}%</p></div></div>`;
      btn.textContent = 'Continue to Dashboard'; btn.disabled = false;
      btn.onclick = () => { location.hash = AppState.get('role') === 'employer' ? '#/dashboard/employer' : '#/dashboard/employee'; };
      showToast(isVerified ? 'Verification complete!' : 'Submitted for review', isVerified ? 'success' : 'info');
    } catch (e) { showToast(e.message, 'error'); btn.disabled = false; btn.textContent = 'Retry Verification'; }
  };
}
