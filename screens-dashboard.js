import { getJobs, getEmployerStats, getEmployerApplications, updateApplicationStatus } from './lib/supabase.js';
import { showToast, showLoader, timeAgo, formatPay } from './lib/ui.js';
import AppState from './lib/state.js';

export function bottomNav(active, role) {
  const empItems=[{id:'home',icon:'home',label:'Home',hash:'#/dashboard/employee'},{id:'jobs',icon:'work',label:'Jobs',hash:'#/jobs'},{id:'apps',icon:'assignment_turned_in',label:'Applications',hash:'#/my-applications'},{id:'profile',icon:'person',label:'Profile',hash:'#/profile'}];
  const emplItems=[{id:'home',icon:'home',label:'Home',hash:'#/dashboard/employer'},{id:'applicants',icon:'assignment_turned_in',label:'Applicants',hash:'#/applicants/all'},{id:'jobs',icon:'work',label:'My Jobs',hash:'#/employer-jobs'},{id:'profile',icon:'person',label:'Profile',hash:'#/profile'}];
  const items = role === 'employer' ? emplItems : empItems;
  return `<nav class="bottom-nav">${items.map(i => `<a href="${i.hash}" class="nav-item ${i.id===active?'active':''}"><span class="material-symbols-outlined">${i.icon}</span><span>${i.label}</span></a>`).join('')}</nav>`;
}

function jobCardHTML(job) {
  const company = job.employer?.company_name || 'Company';
  const verified = job.employer?.verification_status === 'verified';
  return `<a href="#/job/${job.id}" class="card" style="padding:20px;text-decoration:none;color:inherit;display:block"><div class="flex gap-md items-center"><div style="width:56px;height:56px;border-radius:16px;background:var(--surface-container-low);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:28px;color:var(--primary-container)">apartment</span></div><div style="flex:1"><h4 class="text-h3" style="font-size:18px;margin-bottom:4px">${job.title}</h4><div class="flex items-center gap-sm"><span class="text-label-md text-outline">${company}</span>${verified?'<span class="chip chip-verified" style="font-size:10px;padding:2px 6px">VERIFIED</span>':''}</div></div><span class="material-symbols-outlined text-outline">bookmark</span></div><div class="highlight-grid" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(241,241,241,0.5)"><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:20px">payments</span><div><p style="font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase">Pay</p><p class="text-label-md">${formatPay(job.pay_amount,job.pay_unit)}</p></div></div><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:20px">schedule</span><div><p style="font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase">Shift</p><p class="text-label-md">${job.shift_type||'Flexible'}</p></div></div><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:20px">location_on</span><div><p style="font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase">Location</p><p class="text-label-md">${job.location||'Remote'}</p></div></div><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-primary-container" style="font-size:20px">work_history</span><div><p style="font-size:10px;font-weight:700;color:var(--outline);text-transform:uppercase">Posted</p><p class="text-label-md">${timeAgo(job.created_at)}</p></div></div></div></a>`;
}

function jobCardSmall(job) {
  const company = job.employer?.company_name || 'Company';
  const verified = job.employer?.verification_status === 'verified';
  return `<a href="#/job/${job.id}" class="job-card-h" style="text-decoration:none;color:inherit"><div class="flex justify-between items-center"><div style="width:48px;height:48px;border-radius:12px;background:var(--surface-container-low);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--primary-container)">apartment</span></div>${verified?'<span class="chip chip-verified">Verified</span>':''}</div><div><p class="text-label-sm text-outline">${company}</p><h4 style="font-weight:700;font-size:16px">${job.title}</h4></div><div class="flex gap-md" style="margin-top:auto"><div class="flex items-center gap-sm text-outline text-label-md"><span class="material-symbols-outlined" style="font-size:16px">payments</span>${formatPay(job.pay_amount,job.pay_unit)}</div><div class="flex items-center gap-sm text-outline text-label-md"><span class="material-symbols-outlined" style="font-size:16px">schedule</span>${job.shift_type||'Flex'}</div></div></a>`;
}

export async function renderEmployeeDashboard(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employee'; return; }
  showLoader(el, 'Loading dashboard...');
  try {
    const [recommended, allJobs] = await Promise.all([getJobs({ limit: 5 }), getJobs({})]);
    const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0052cc&color=fff&size=80`;
    const vStatus = profile.verification_status;
    const vColor = vStatus === 'verified' ? 'var(--secondary)' : 'var(--tertiary-container)';
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-sm"><img src="${avatar}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--primary-container)"><span class="top-bar-brand">ShiftIn</span></div><div class="top-bar-actions"><button class="top-bar-icon"><span class="material-symbols-outlined">notifications</span></button></div></header>
    <main style="padding-bottom:100px" class="animate-fade">
    <section style="padding:24px 20px 0"><div class="banner-primary"><div><span class="text-label-sm" style="color:var(--on-primary-container);opacity:0.8;text-transform:uppercase;letter-spacing:0.05em">Account Status</span><div class="flex items-center gap-sm" style="margin-top:4px"><h2 class="text-h3 text-white">Verification: ${vStatus}</h2><span class="material-symbols-outlined icon-filled" style="color:${vColor};font-size:20px">${vStatus==='verified'?'verified':'pending'}</span></div></div><div style="width:48px;height:48px;background:rgba(255,255,255,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined text-white" style="font-size:28px">shield</span></div></div></section>
    <section style="margin-top:32px"><div style="padding:0 20px;margin-bottom:16px" class="flex justify-between items-center"><h3 class="text-h3">Recommended Jobs</h3><button class="text-label-md text-primary-container">View all</button></div><div class="scroll-row hide-scrollbar" style="padding:0 20px">${recommended.length ? recommended.map(j => jobCardSmall(j)).join('') : '<p class="text-body-md text-outline" style="padding:20px">No jobs yet. Check back soon!</p>'}</div></section>
    <section style="margin-top:32px;padding:0 20px"><div class="mb-md"><h3 class="text-h3">Browse Jobs</h3><p class="text-body-sm text-outline">Explore new opportunities</p></div><div class="mb-md"><input class="input-field" placeholder="Search jobs..." id="search-jobs" style="height:48px"></div><div class="flex flex-col gap-md" id="jobs-list">${allJobs.map(j => jobCardHTML(j)).join('') || '<p class="text-body-md text-outline">No jobs available.</p>'}</div></section>
    </main>${bottomNav('home','employee')}`;
    document.getElementById('search-jobs').oninput = async (e) => {
      const q = e.target.value.trim();
      const filtered = q ? await getJobs({ search: q }) : allJobs;
      document.getElementById('jobs-list').innerHTML = filtered.map(j => jobCardHTML(j)).join('') || '<p class="text-body-md text-outline">No matches.</p>';
    };
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">Error: ${e.message}</p><button class="btn-primary mt-md" onclick="location.reload()">Retry</button></div>`; }
}

export async function renderEmployerDashboard(el) {
  const profile = AppState.get('profile');
  if (!profile) { location.hash = '#/login/employer'; return; }
  showLoader(el, 'Loading dashboard...');
  try {
    const [stats, apps] = await Promise.all([getEmployerStats(profile.id), getEmployerApplications(profile.id)]);
    const recentApps = apps.slice(0, 5);
    const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.company_name||profile.full_name)}&background=006a65&color=fff&size=80`;
    el.innerHTML = `
    <header class="top-bar"><div class="flex items-center gap-sm"><img src="${avatar}" alt="" class="top-bar-avatar"><div><span class="top-bar-brand" style="display:block;line-height:1.2">ShiftIn</span><span class="chip chip-verified" style="font-size:10px;padding:2px 8px">${profile.verification_status==='verified'?'✓ Verified Employer':'Pending'}</span></div></div><div class="top-bar-actions"><button class="top-bar-icon"><span class="material-symbols-outlined">notifications</span></button></div></header>
    <main class="page-content-wide animate-fade">
    <section class="mb-lg"><h2 class="text-h1 mb-sm">Welcome back, ${(profile.full_name||'').split(' ')[0]||'there'}</h2><p class="text-body-lg text-on-surface-variant">Here's your hiring pipeline.</p></section>
    <section class="grid-3 mb-lg">
    <div class="metric-card"><p class="text-label-md text-on-surface-variant mb-sm">Active Job Posts</p><h3 class="text-h1 text-primary">${stats.activeJobs}</h3></div>
    <div class="metric-card"><p class="text-label-md text-on-surface-variant mb-sm">Total Applicants</p><h3 class="text-h1 text-primary">${stats.totalApplicants}</h3></div>
    <div style="background:var(--primary-container);border-radius:16px;padding:24px;color:#fff"><h3 class="text-h3 mb-sm">Scale your team</h3><p class="text-body-sm" style="opacity:0.9">Reach 50,000+ students.</p><button class="btn-primary" style="background:#fff;color:var(--primary);box-shadow:none;margin-top:16px" onclick="location.hash='#/post-job'"><span class="material-symbols-outlined">rocket_launch</span>Post a New Job</button></div>
    </section>
    <section class="mb-lg"><div class="flex justify-between items-center mb-md"><h2 class="text-h2">Recent Applicants</h2></div><div class="flex flex-col gap-md" id="apps-list">${recentApps.length ? recentApps.map(a => appCardHTML(a)).join('') : '<p class="text-body-md text-outline">No applicants yet.</p>'}</div></section>
    </main>
    <button class="fab" onclick="location.hash='#/post-job'"><span class="material-symbols-outlined" style="font-size:28px">add</span></button>
    ${bottomNav('home','employer')}`;
    el.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.appId, action = btn.dataset.action;
        try { await updateApplicationStatus(id, action); showToast(`Application ${action}`, 'success'); renderEmployerDashboard(el); } catch(e) { showToast(e.message, 'error'); }
      };
    });
  } catch (e) { el.innerHTML = `<div class="page-content"><p class="text-error">Error: ${e.message}</p><button class="btn-primary mt-md" onclick="location.reload()">Retry</button></div>`; }
}

function appCardHTML(a) {
  const student = a.student || {};
  const name = student.full_name || 'Unknown';
  const avatar = student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e7e7f2&color=191b23&size=112`;
  const skills = (student.skills || []).join(', ');
  return `<div class="applicant-card"><div class="flex items-center gap-md"><img src="${avatar}" alt="${name}" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><div><h4 class="text-h3">${name}</h4><p class="text-body-sm text-on-surface-variant">Applied for: <span style="font-weight:600;color:var(--primary)">${a.job?.title||'Job'}</span></p><div class="flex gap-sm" style="margin-top:4px">${student.college?`<span style="background:var(--surface-container-low);font-size:11px;padding:2px 8px;border-radius:var(--radius-full)">${student.college}</span>`:''}<span style="background:var(--surface-container-low);font-size:11px;padding:2px 8px;border-radius:var(--radius-full)">${skills||'N/A'}</span></div></div></div><div class="flex items-center gap-sm">${a.status==='pending'?`<button class="btn-outline" data-action="rejected" data-app-id="${a.id}">Reject</button><button class="btn-tonal" data-action="shortlisted" data-app-id="${a.id}"><span class="material-symbols-outlined" style="font-size:18px">star</span>Shortlist</button>`:`<span class="chip ${a.status==='shortlisted'?'chip-verified':'chip-review'}">${a.status}</span>`}</div></div>`;
}
