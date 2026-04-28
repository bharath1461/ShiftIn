import { bottomNav } from './screens-dashboard.js';
import { getJobById, createJob, createApplication, getJobApplications, getEmployerApplications, updateApplicationStatus, uploadFile, getStudentApplications } from './lib/supabase.js';
import { signOut } from './lib/auth.js';
import { showToast, showLoader, timeAgo, formatPay } from './lib/ui.js';
import AppState from './lib/state.js';

export async function renderJobDetails(el, params) {
  const profile = AppState.get('profile');
  showLoader(el, 'Loading job...');
  try {
    const job = await getJobById(params.id);
    if (!job) { el.innerHTML = '<div class="page-content"><p class="text-error">Job not found.</p></div>'; return; }
    const company = job.employer?.company_name || 'Company';
    const verified = job.employer?.verification_status === 'verified';
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-md"><a href="#/dashboard/employee" class="back-btn"><span class="material-symbols-outlined">arrow_back</span></a><span class="top-bar-brand">ShiftIn</span></div></header>
    <main class="page-content animate-fade" style="padding-bottom:120px">
    <div class="card mb-md"><div class="flex justify-between items-center mb-md"><div class="flex items-center gap-sm"><div style="width:48px;height:48px;border-radius:12px;background:var(--surface-container-low);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--primary-container)">storefront</span></div><div><div class="flex items-center gap-sm"><p class="text-label-md text-on-surface-variant uppercase tracking-wider">${company}</p>${verified?'<span class="material-symbols-outlined icon-filled" style="color:var(--primary-container);font-size:18px">verified</span>':''}</div><h2 class="text-h2">${job.title}</h2></div></div></div>
    <div class="highlight-grid"><div class="highlight-item"><div class="highlight-icon" style="background:rgba(111,247,238,0.2)"><span class="material-symbols-outlined" style="color:var(--on-secondary-container)">payments</span></div><div><p style="font-size:10px;font-weight:700;color:var(--on-surface-variant);text-transform:uppercase">Pay</p><p class="text-h3">${formatPay(job.pay_amount,job.pay_unit)}</p></div></div><div class="highlight-item"><div class="highlight-icon" style="background:rgba(0,82,204,0.1)"><span class="material-symbols-outlined" style="color:var(--primary-container)">schedule</span></div><div><p style="font-size:10px;font-weight:700;color:var(--on-surface-variant);text-transform:uppercase">Shift</p><p class="text-h3">${job.shift_type||'Flexible'}</p></div></div></div></div>
    <div class="grid-2 mb-md"><div class="card" style="padding:16px"><h3 class="text-label-md mb-sm">Location</h3><p class="text-body-sm text-on-surface-variant">${job.location||'Remote'}</p></div><div class="card" style="padding:16px"><h3 class="text-label-md mb-sm">Info</h3><div class="flex flex-col gap-sm"><div class="flex justify-between"><span class="text-body-sm text-on-surface-variant">Status</span><span class="chip chip-verified">${job.status}</span></div><div class="flex justify-between"><span class="text-body-sm text-on-surface-variant">Posted</span><span class="text-body-sm">${timeAgo(job.created_at)}</span></div><div class="flex justify-between"><span class="text-body-sm text-on-surface-variant">Openings</span><span class="text-body-sm">${job.openings||1}</span></div></div></div></div>
    ${job.description?`<div class="mb-md"><h3 class="text-h3 mb-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container">description</span>Description</h3><div class="card"><p class="text-body-md text-on-surface-variant" style="line-height:1.7;white-space:pre-wrap">${job.description}</p></div></div>`:''}
    ${job.requirements?`<div><h3 class="text-h3 mb-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container">checklist</span>Requirements</h3><div class="card"><p class="text-body-md text-on-surface-variant" style="line-height:1.7;white-space:pre-wrap">${job.requirements}</p></div></div>`:''}
    </main>
    ${profile&&profile.role==='student'?`<div class="bottom-action"><div class="bottom-action-inner"><button class="btn-primary" style="flex:1" onclick="location.hash='#/apply/${job.id}'" id="btn-apply-now">Apply Now <span class="material-symbols-outlined">arrow_forward</span></button></div></div>`:''}`;
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">Error: ${e.message}</p></div>`; }
}

export async function renderApplicationFlow(el, params) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employee'; return; }
  showLoader(el, 'Loading...');
  try {
    const job = await getJobById(params.id);
    if (!job) { el.innerHTML = '<div class="page-content"><p>Job not found</p></div>'; return; }
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-md"><a href="#/job/${params.id}" class="back-btn"><span class="material-symbols-outlined">arrow_back</span></a><span class="top-bar-brand" style="font-size:18px">Submit Application</span></div></header>
    <main class="page-content animate-fade" style="padding-bottom:120px">
    <div class="card mb-lg"><div class="flex items-center gap-md"><div style="width:56px;height:56px;border-radius:12px;background:rgba(0,61,155,0.05);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--primary);font-size:28px">storefront</span></div><div><h2 class="text-h3">${job.title}</h2><p class="text-body-sm text-on-surface-variant">${job.employer?.company_name||''} • ${job.location||'Remote'}</p></div></div></div>
    <form id="apply-form" class="flex flex-col gap-lg">
    <div><label class="input-label">Attach Resume</label><label style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:140px;border:2px dashed var(--outline-variant);border-radius:16px;background:var(--surface-container-low);cursor:pointer;padding:24px" for="resume-file" id="resume-zone"><span class="material-symbols-outlined text-primary" style="font-size:28px">upload_file</span><p class="text-button">Click to upload</p><p class="text-body-sm text-on-surface-variant">PDF, DOCX (Max 5MB)</p></label><input type="file" id="resume-file" accept=".pdf,.docx" style="display:none"></div>
    <div class="card"><label class="input-label mb-md">Confirm Availability</label><div class="flex flex-col gap-sm"><label style="display:flex;align-items:center;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer;gap:12px"><input type="radio" name="avail" value="I can start immediately" style="accent-color:var(--primary);width:20px;height:20px"><span>I can start immediately</span></label><label style="display:flex;align-items:center;padding:16px;border-radius:12px;border:1px solid var(--outline-variant);cursor:pointer;gap:12px"><input type="radio" name="avail" value="I have a 2-week notice period" style="accent-color:var(--primary);width:20px;height:20px"><span>I have a 2-week notice period</span></label></div></div>
    <div class="card"><label class="input-label mb-sm">Why you're a great fit</label><textarea class="input-field" style="height:auto;min-height:120px;padding:16px;resize:none;border-radius:12px" placeholder="Describe your relevant skills..." id="cover-letter"></textarea></div>
    </form></main>
    <div class="bottom-action"><div class="bottom-action-inner"><button class="btn-primary" style="flex:1" id="btn-submit-app">Submit Application <span class="material-symbols-outlined" style="font-size:20px">send</span></button></div></div>
    <div class="modal-overlay" id="success-overlay"><div class="modal-card animate-scale"><div style="width:80px;height:80px;background:rgba(111,247,238,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px"><span class="material-symbols-outlined icon-filled" style="font-size:40px;color:var(--secondary)">check_circle</span></div><h3 class="text-h2 mb-sm">Application Sent!</h3><p class="text-body-md text-on-surface-variant" style="margin-bottom:32px">We'll notify you of updates.</p><button class="btn-primary" onclick="location.hash='#/dashboard/employee'">Back to Dashboard</button></div></div>`;
    let resumeFile = null;
    document.getElementById('resume-file').onchange = (e) => { resumeFile = e.target.files[0]; if (resumeFile) document.getElementById('resume-zone').innerHTML = `<span class="material-symbols-outlined text-secondary">check_circle</span><p class="text-button">${resumeFile.name}</p>`; };
    document.getElementById('btn-submit-app').onclick = async () => {
      const btn = document.getElementById('btn-submit-app');
      btn.disabled = true; btn.innerHTML = 'Submitting...';
      try {
        let resumeUrl = null;
        if (resumeFile) resumeUrl = await uploadFile('resumes', `${profile.id}/${Date.now()}_${resumeFile.name}`, resumeFile);
        const avail = document.querySelector('input[name="avail"]:checked');
        await createApplication({ job_id: params.id, student_id: profile.id, resume_url: resumeUrl, cover_letter: document.getElementById('cover-letter').value, availability_note: avail?.value || '' });
        document.getElementById('success-overlay').classList.add('show');
      } catch (e) { showToast(e.message || 'Failed to apply', 'error'); btn.disabled = false; btn.innerHTML = 'Submit Application'; }
    };
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">${e.message}</p></div>`; }
}

export function renderPostJob(el) {
  const profile = AppState.get('profile');
  if (!profile || profile.role !== 'employer') { location.hash = '#/login/employer'; return; }
  el.innerHTML = `
  <header class="top-bar"><div class="flex items-center gap-md"><a href="#/dashboard/employer" class="back-btn"><span class="material-symbols-outlined">arrow_back</span></a><span class="top-bar-brand">ShiftIn</span></div></header>
  <main class="page-content-wide animate-fade" style="padding-top:32px">
  <h2 class="text-h1 mb-sm">Create a New Job</h2><p class="text-body-md text-on-surface-variant mb-lg">Provide details to find the perfect candidate.</p>
  <form id="post-form" style="display:grid;gap:24px;max-width:900px">
  <div class="grid-2" style="gap:24px"><div class="card"><div class="flex flex-col gap-md"><div><label class="input-label">Job Title *</label><input class="input-field" id="job-title" required></div><div class="grid-2"><div><label class="input-label">Category</label><select class="input-field" id="job-cat"><option>Select</option><option>Hospitality</option><option>Retail</option><option>Technology</option><option>Logistics</option><option>General Labor</option></select></div><div><label class="input-label">Openings</label><input class="input-field" type="number" id="openings" value="1" min="1"></div></div></div></div>
  <div style="background:var(--primary-container);border-radius:20px;padding:24px;color:var(--on-primary-container)"><span class="material-symbols-outlined" style="font-size:36px;margin-bottom:16px">payments</span><h3 class="text-h3 mb-md">Pay Rate</h3><div class="grid-2"><div><label class="input-label" style="color:inherit">Amount *</label><input class="input-field" type="number" step="0.01" id="pay-amount" required style="background:rgba(255,255,255,0.2);border:none;color:#fff" placeholder="25.00"></div><div><label class="input-label" style="color:inherit">Per</label><select class="input-field" id="pay-unit" style="background:rgba(255,255,255,0.2);border:none;color:#fff"><option value="hr">Hour</option><option value="shift">Shift</option><option value="month">Month</option></select></div></div></div></div>
  <div class="grid-2"><div class="card"><h3 class="text-h3 mb-md">Shift Timing</h3><div class="grid-2"><div><label class="input-label">Start</label><input class="input-field" type="datetime-local" id="shift-start"></div><div><label class="input-label">End</label><input class="input-field" type="datetime-local" id="shift-end"></div></div><div class="mt-md"><label class="input-label">Shift Type</label><select class="input-field" id="shift-type"><option>Full-time</option><option>Part-time</option><option>Evening Shift</option><option>Morning Shift</option><option>Flexible</option></select></div></div>
  <div class="card"><h3 class="text-h3 mb-md">Location</h3><input class="input-field" placeholder="Address or 'Remote'" id="job-location"></div></div>
  <div class="card"><h3 class="text-h3 mb-md">Description *</h3><textarea class="input-field" style="height:auto;min-height:140px;padding:16px;resize:none" placeholder="Describe the role, responsibilities..." id="job-desc" required></textarea></div>
  <div class="card"><h3 class="text-h3 mb-md">Requirements</h3><textarea class="input-field" style="height:auto;min-height:100px;padding:16px;resize:none" placeholder="Skills, qualifications..." id="job-reqs"></textarea></div>
  <div class="flex gap-md justify-between" style="padding:24px 0"><button type="button" class="btn-outline" style="padding:16px 32px">Save Draft</button><button type="submit" class="btn-primary" style="width:auto;padding:0 48px" id="btn-publish">Publish Job</button></div>
  </form></main>`;
  document.getElementById('post-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-publish');
    btn.disabled = true; btn.textContent = 'Publishing...';
    try {
      await createJob({ employer_id: profile.id, title: document.getElementById('job-title').value, category: document.getElementById('job-cat').value, description: document.getElementById('job-desc').value, requirements: document.getElementById('job-reqs').value, pay_amount: parseFloat(document.getElementById('pay-amount').value), pay_unit: document.getElementById('pay-unit').value, shift_type: document.getElementById('shift-type').value, shift_start: document.getElementById('shift-start').value || null, shift_end: document.getElementById('shift-end').value || null, location: document.getElementById('job-location').value, openings: parseInt(document.getElementById('openings').value) || 1, is_verified: profile.verification_status === 'verified' });
      showToast('Job published!', 'success');
      location.hash = '#/dashboard/employer';
    } catch (e) { showToast(e.message, 'error'); btn.disabled = false; btn.textContent = 'Publish Job'; }
  };
}

export async function renderApplicantManagement(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employer'; return; }
  showLoader(el, 'Loading applicants...');
  try {
    const apps = await getEmployerApplications(profile.id);
    const tabs = { all: apps, pending: apps.filter(a=>a.status==='pending'), shortlisted: apps.filter(a=>a.status==='shortlisted'), hired: apps.filter(a=>a.status==='hired'), rejected: apps.filter(a=>a.status==='rejected') };
    let activeTab = 'all';
    function render() {
      const list = tabs[activeTab] || [];
      el.innerHTML = `
      <header class="top-bar"><div class="flex items-center gap-sm"><span class="top-bar-brand">ShiftIn</span></div></header>
      <main class="page-content-wide animate-fade">
      <h1 class="text-h1 mb-sm">Applicant Management</h1><p class="text-body-md text-on-surface-variant mb-lg">${apps.length} total applicants</p>
      <nav class="flex gap-sm hide-scrollbar mb-lg" style="overflow-x:auto">${Object.entries(tabs).map(([k,v])=>`<button class="tab-btn" data-tab="${k}" style="padding:10px 20px;border-radius:var(--radius-full);${activeTab===k?'background:var(--primary-container);color:#fff':'background:var(--surface-container-high);color:var(--on-surface-variant)'};font-weight:600;font-size:14px;white-space:nowrap">${k.charAt(0).toUpperCase()+k.slice(1)} (${v.length})</button>`).join('')}</nav>
      <div class="grid-3" id="app-cards">${list.length ? list.map(a => miniCard(a)).join('') : '<p class="text-body-md text-outline">No applicants in this category.</p>'}</div>
      </main>${bottomNav('applicants','employer')}`;
      el.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => { activeTab = b.dataset.tab; render(); });
      el.querySelectorAll('[data-action]').forEach(b => {
        b.onclick = async () => { try { await updateApplicationStatus(b.dataset.appId, b.dataset.action); showToast('Updated!', 'success'); const updated = await getEmployerApplications(profile.id); Object.assign(tabs, { all: updated, pending: updated.filter(a=>a.status==='pending'), shortlisted: updated.filter(a=>a.status==='shortlisted'), hired: updated.filter(a=>a.status==='hired'), rejected: updated.filter(a=>a.status==='rejected') }); render(); } catch(e) { showToast(e.message,'error'); } };
      });
    }
    render();
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">${e.message}</p></div>`; }
}

function miniCard(a) {
  const s = a.student || {};
  const name = s.full_name || 'Unknown';
  const avatar = s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e7e7f2&color=191b23&size=112`;
  return `<article class="card" style="display:flex;flex-direction:column;gap:16px"><div class="flex items-center gap-md"><img src="${avatar}" alt="${name}" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><div><h3 class="text-h3">${name}</h3><p class="text-body-sm text-on-surface-variant">${s.college||''}</p><p class="text-body-sm text-primary" style="font-weight:600">${a.job?.title||''}</p></div></div><div class="flex" style="flex-wrap:wrap;gap:8px">${(s.skills||[]).map(sk=>`<span class="chip chip-pending">${sk}</span>`).join('')}</div>${a.cover_letter?`<p class="text-body-sm text-on-surface-variant" style="border-top:1px solid rgba(241,241,241,0.5);padding-top:12px"><em>"${a.cover_letter.substring(0,100)}${a.cover_letter.length>100?'...':''}"</em></p>`:''}<div class="grid-2">${a.status==='pending'?`<button style="padding:10px;border-radius:var(--radius-full);border:1px solid var(--error);color:var(--error);font-weight:600;font-size:14px" data-action="rejected" data-app-id="${a.id}">Reject</button><button class="btn-primary" style="height:auto;padding:10px;font-size:14px;box-shadow:none" data-action="shortlisted" data-app-id="${a.id}">Shortlist</button>`:`<span class="chip ${a.status==='shortlisted'?'chip-verified':a.status==='hired'?'chip-verified':'chip-review'}" style="text-align:center;padding:10px">${a.status}</span>`}</div></article>`;
}

export async function renderProfile(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/role'; return; }
  const isStudent = profile.role === 'student';
  const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0052cc&color=fff&size=192`;
  let appsInfo = '';
  if (isStudent) {
    try { const apps = await getStudentApplications(profile.id); appsInfo = `${apps.length} applications submitted`; } catch { appsInfo = ''; }
  }
  el.innerHTML = `
  <header class="top-bar"><span class="top-bar-brand">ShiftIn</span></header>
  <main class="page-content animate-fade">
  <section class="flex flex-col items-center mb-lg"><div style="position:relative;margin-bottom:16px"><div style="width:96px;height:96px;border-radius:50%;box-shadow:0 4px 16px rgba(0,0,0,0.1);overflow:hidden;border:4px solid #fff"><img src="${avatar}" alt="${profile.full_name}" style="width:100%;height:100%;object-fit:cover"></div>${profile.verification_status==='verified'?'<div style="position:absolute;bottom:4px;right:4px;background:var(--primary);color:#fff;padding:4px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined icon-filled" style="font-size:16px">verified</span></div>':''}</div><h2 class="text-h2">${profile.full_name}</h2><p class="text-body-sm text-outline mb-sm">${isStudent?`${profile.course||''} · ${profile.college||''}`:profile.company_name||''}</p><p class="text-body-sm text-on-surface-variant">${profile.email||''}</p>${appsInfo?`<p class="text-body-sm text-secondary mt-sm">${appsInfo}</p>`:''}</section>
  <div class="flex flex-col gap-md">
  <div class="settings-group"><div class="settings-group-header"><h4 class="text-label-md text-outline">Profile Info</h4></div>${isStudent?`<div class="settings-item"><div class="flex items-center gap-md"><div class="settings-icon"><span class="material-symbols-outlined">school</span></div><div><span class="text-body-md">${profile.college||'Not set'}</span><br><span class="text-body-sm text-outline">${profile.semester||''}</span></div></div></div><div class="settings-item"><div class="flex items-center gap-md"><div class="settings-icon"><span class="material-symbols-outlined">star</span></div><div><span class="text-body-md">Skills</span><br><span class="text-body-sm text-outline">${(profile.skills||[]).join(', ')||'None'}</span></div></div></div>`:`<div class="settings-item"><div class="flex items-center gap-md"><div class="settings-icon"><span class="material-symbols-outlined">business</span></div><div><span class="text-body-md">${profile.company_name||'Not set'}</span><br><span class="text-body-sm text-outline">${profile.business_type||''}</span></div></div></div>`}<div class="settings-item"><div class="flex items-center gap-md"><div class="settings-icon"><span class="material-symbols-outlined">verified_user</span></div><span class="text-body-md">Verification: <span class="chip ${profile.verification_status==='verified'?'chip-verified':'chip-review'}">${profile.verification_status}</span></span></div></div></div>
  <div class="settings-group"><div class="settings-group-header"><h4 class="text-label-md text-outline">Account</h4></div><a href="#" class="settings-item"><div class="flex items-center gap-md"><div class="settings-icon"><span class="material-symbols-outlined">lock</span></div><span class="text-body-md">Security & Privacy</span></div><span class="material-symbols-outlined text-outline">chevron_right</span></a></div>
  <button style="width:100%;padding:16px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--error);font-weight:600;font-size:16px;border-radius:12px;border:2px solid rgba(186,26,26,0.1);margin-top:16px" id="btn-signout"><span class="material-symbols-outlined">logout</span>Sign Out</button>
  <p class="text-center text-label-sm" style="color:var(--outline-variant);padding:24px 0">ShiftIn v2.4.0</p>
  </div></main>${bottomNav('profile', profile.role === 'employer' ? 'employer' : 'employee')}`;
  document.getElementById('btn-signout').onclick = async () => { await signOut(); showToast('Signed out', 'info'); location.hash = '#/'; };
}
