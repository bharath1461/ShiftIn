import { bottomNav } from './screens-dashboard.js';
import { getJobs, getStudentApplications, getEmployerJobs } from './lib/supabase.js';
import { showLoader, timeAgo, formatPay } from './lib/ui.js';
import AppState from './lib/state.js';

// ===================== BROWSE ALL JOBS (Student) =====================
export async function renderBrowseJobs(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employee'; return; }
  showLoader(el, 'Loading jobs...');
  try {
    const jobs = await getJobs({});
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-sm"><span class="top-bar-brand">ShiftIn</span></div></header>
    <main class="page-content animate-fade">
    <h1 class="text-h1 mb-sm">Browse Jobs</h1>
    <p class="text-body-md text-on-surface-variant mb-lg">${jobs.length} opportunities available</p>
    <input class="input-field mb-md" placeholder="Search by title..." id="search-jobs" style="height:48px">
    <div class="flex gap-sm mb-lg hide-scrollbar" style="overflow-x:auto">
      <button class="filter-btn active-filter" data-cat="all" style="padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px;white-space:nowrap;background:var(--primary-container);color:#fff;border:none">All</button>
      <button class="filter-btn" data-cat="Technology" style="padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px;white-space:nowrap;background:var(--surface-container-high);color:var(--on-surface-variant);border:none">Technology</button>
      <button class="filter-btn" data-cat="Hospitality" style="padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px;white-space:nowrap;background:var(--surface-container-high);color:var(--on-surface-variant);border:none">Hospitality</button>
      <button class="filter-btn" data-cat="Logistics" style="padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px;white-space:nowrap;background:var(--surface-container-high);color:var(--on-surface-variant);border:none">Logistics</button>
      <button class="filter-btn" data-cat="Marketing" style="padding:8px 16px;border-radius:var(--radius-full);font-weight:600;font-size:13px;white-space:nowrap;background:var(--surface-container-high);color:var(--on-surface-variant);border:none">Marketing</button>
    </div>
    <div class="flex flex-col gap-md" id="jobs-list">${jobs.map(j => jobCard(j)).join('') || '<p class="text-body-md text-outline">No jobs found.</p>'}</div>
    </main>${bottomNav('jobs','employee')}`;
    let allJobs = jobs;
    document.getElementById('search-jobs').oninput = async (e) => {
      const q = e.target.value.trim();
      const filtered = q ? await getJobs({ search: q }) : allJobs;
      document.getElementById('jobs-list').innerHTML = filtered.map(j => jobCard(j)).join('') || '<p class="text-body-md text-outline">No matches.</p>';
    };
    el.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = async () => {
        el.querySelectorAll('.filter-btn').forEach(b => { b.style.background = 'var(--surface-container-high)'; b.style.color = 'var(--on-surface-variant)'; });
        btn.style.background = 'var(--primary-container)'; btn.style.color = '#fff';
        const cat = btn.dataset.cat;
        const filtered = cat === 'all' ? await getJobs({}) : await getJobs({ category: cat });
        allJobs = filtered;
        document.getElementById('jobs-list').innerHTML = filtered.map(j => jobCard(j)).join('') || '<p class="text-body-md text-outline">No jobs in this category.</p>';
      };
    });
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">${e.message}</p></div>`; }
}

// ===================== MY APPLICATIONS (Student) =====================
export async function renderMyApplications(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employee'; return; }
  showLoader(el, 'Loading applications...');
  try {
    const apps = await getStudentApplications(profile.id);
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-sm"><span class="top-bar-brand">ShiftIn</span></div></header>
    <main class="page-content animate-fade">
    <h1 class="text-h1 mb-sm">My Applications</h1>
    <p class="text-body-md text-on-surface-variant mb-lg">${apps.length} application${apps.length !== 1 ? 's' : ''} submitted</p>
    <div class="flex flex-col gap-md">${apps.length ? apps.map(a => {
      const job = a.job || {};
      const company = job.employer?.company_name || 'Company';
      const statusColors = { pending: 'var(--tertiary-container)', shortlisted: 'var(--secondary)', hired: 'var(--primary)', rejected: 'var(--error)' };
      const statusIcons = { pending: 'schedule', shortlisted: 'star', hired: 'check_circle', rejected: 'cancel' };
      return `<div class="card" style="padding:20px"><div class="flex justify-between items-center mb-md"><div class="flex items-center gap-md"><div style="width:48px;height:48px;border-radius:12px;background:var(--surface-container-low);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--primary-container)">apartment</span></div><div><h3 class="text-h3" style="font-size:17px">${job.title || 'Job'}</h3><p class="text-body-sm text-on-surface-variant">${company}</p></div></div><span class="chip" style="background:${statusColors[a.status] || 'var(--outline)'}20;color:${statusColors[a.status] || 'var(--outline)'}"><span class="material-symbols-outlined icon-filled" style="font-size:14px">${statusIcons[a.status] || 'info'}</span> ${a.status}</span></div><div class="flex justify-between items-center" style="padding-top:12px;border-top:1px solid rgba(241,241,241,0.5)"><div class="flex gap-lg"><span class="text-body-sm text-outline">${formatPay(job.pay_amount, job.pay_unit)}</span><span class="text-body-sm text-outline">${job.location || 'Remote'}</span></div><span class="text-body-sm text-outline">${timeAgo(a.created_at)}</span></div></div>`;
    }).join('') : '<div class="text-center" style="padding:48px 0"><span class="material-symbols-outlined text-outline" style="font-size:64px;margin-bottom:16px">description</span><h3 class="text-h3 mb-sm">No applications yet</h3><p class="text-body-md text-on-surface-variant mb-lg">Start applying to jobs you like!</p><a href="#/jobs" class="btn-primary" style="display:inline-flex;width:auto;padding:0 32px">Browse Jobs</a></div>'}</div>
    </main>${bottomNav('apps','employee')}`;
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">${e.message}</p></div>`; }
}

// ===================== EMPLOYER JOBS =====================
export async function renderEmployerJobs(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employer'; return; }
  showLoader(el, 'Loading your jobs...');
  try {
    const jobs = await getEmployerJobs(profile.id);
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-sm"><span class="top-bar-brand">ShiftIn</span></div><div class="top-bar-actions"><button class="btn-primary" style="width:auto;height:auto;padding:8px 16px;font-size:14px" onclick="location.hash='#/post-job'"><span class="material-symbols-outlined" style="font-size:18px">add</span>New Job</button></div></header>
    <main class="page-content animate-fade">
    <h1 class="text-h1 mb-sm">My Job Posts</h1>
    <p class="text-body-md text-on-surface-variant mb-lg">${jobs.length} job${jobs.length !== 1 ? 's' : ''} posted</p>
    <div class="flex flex-col gap-md">${jobs.length ? jobs.map(j => {
      const appCount = j.applications?.[0]?.count || 0;
      return `<div class="card" style="padding:20px"><div class="flex justify-between items-center mb-md"><div><h3 class="text-h3" style="font-size:17px">${j.title}</h3><p class="text-body-sm text-on-surface-variant">${j.category || ''} • ${j.location || 'Remote'}</p></div><span class="chip ${j.status === 'active' ? 'chip-verified' : 'chip-review'}">${j.status}</span></div><div class="flex justify-between items-center" style="padding-top:12px;border-top:1px solid rgba(241,241,241,0.5)"><div class="flex gap-lg"><span class="text-body-sm"><strong>${formatPay(j.pay_amount, j.pay_unit)}</strong></span><span class="text-body-sm text-outline">${j.shift_type || 'Flexible'}</span><span class="text-body-sm text-outline">${appCount} applicant${appCount !== 1 ? 's' : ''}</span></div><span class="text-body-sm text-outline">${timeAgo(j.created_at)}</span></div></div>`;
    }).join('') : '<div class="text-center" style="padding:48px 0"><span class="material-symbols-outlined text-outline" style="font-size:64px;margin-bottom:16px">work</span><h3 class="text-h3 mb-sm">No jobs posted yet</h3><p class="text-body-md text-on-surface-variant mb-lg">Create your first job listing!</p><a href="#/post-job" class="btn-primary" style="display:inline-flex;width:auto;padding:0 32px">Post a Job</a></div>'}</div>
    </main>
    <button class="fab" onclick="location.hash='#/post-job'"><span class="material-symbols-outlined" style="font-size:28px">add</span></button>
    ${bottomNav('jobs','employer')}`;
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">${e.message}</p></div>`; }
}

// Shared job card
function jobCard(job) {
  const company = job.employer?.company_name || 'Company';
  const verified = job.employer?.verification_status === 'verified';
  return `<a href="#/job/${job.id}" class="card" style="padding:20px;text-decoration:none;color:inherit;display:block"><div class="flex gap-md items-center"><div style="width:48px;height:48px;border-radius:12px;background:var(--surface-container-low);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:24px;color:var(--primary-container)">apartment</span></div><div style="flex:1"><h4 class="text-h3" style="font-size:17px;margin-bottom:2px">${job.title}</h4><div class="flex items-center gap-sm"><span class="text-label-md text-outline">${company}</span>${verified ? '<span class="chip chip-verified" style="font-size:10px;padding:2px 6px">VERIFIED</span>' : ''}</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(241,241,241,0.5)"><span class="text-body-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:18px">payments</span>${formatPay(job.pay_amount, job.pay_unit)}</span><span class="text-body-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:18px">schedule</span>${job.shift_type || 'Flexible'}</span><span class="text-body-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:18px">location_on</span>${job.location || 'Remote'}</span><span class="text-body-sm flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:18px">work_history</span>${timeAgo(job.created_at)}</span></div></a>`;
}
