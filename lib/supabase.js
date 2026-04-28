// ShiftIn — Supabase Database Service
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import AppState from './state.js';

let supabase = null;

async function getClient() {
  if (supabase) return supabase;
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

// ===================== PROFILES =====================
export async function getProfile(firebaseUid) {
  const sb = await getClient();
  const { data, error } = await sb.from('profiles').select('*').eq('firebase_uid', firebaseUid).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createProfile(profileData) {
  const sb = await getClient();
  const { data, error } = await sb.from('profiles').insert(profileData).select().single();
  if (error) throw error;
  AppState.set({ profile: data, role: data.role });
  return data;
}

export async function updateProfile(id, updates) {
  const sb = await getClient();
  updates.updated_at = new Date().toISOString();
  const { data, error } = await sb.from('profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  AppState.set({ profile: data });
  return data;
}

// ===================== JOBS =====================
export async function getJobs(filters = {}) {
  const sb = await getClient();
  let query = sb.from('jobs').select('*, employer:profiles!employer_id(company_name, avatar_url, verification_status)').eq('status', 'active').order('created_at', { ascending: false });
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getJobById(jobId) {
  const sb = await getClient();
  const { data, error } = await sb.from('jobs').select('*, employer:profiles!employer_id(company_name, avatar_url, company_location, verification_status)').eq('id', jobId).single();
  if (error) throw error;
  return data;
}

export async function getEmployerJobs(employerId) {
  const sb = await getClient();
  const { data, error } = await sb.from('jobs').select('*, applications(count)').eq('employer_id', employerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createJob(jobData) {
  const sb = await getClient();
  const { data, error } = await sb.from('jobs').insert(jobData).select().single();
  if (error) throw error;
  return data;
}

export async function updateJob(jobId, updates) {
  const sb = await getClient();
  updates.updated_at = new Date().toISOString();
  const { data, error } = await sb.from('jobs').update(updates).eq('id', jobId).select().single();
  if (error) throw error;
  return data;
}

// ===================== APPLICATIONS =====================
export async function getStudentApplications(studentId) {
  const sb = await getClient();
  const { data, error } = await sb.from('applications').select('*, job:jobs(title, pay_amount, pay_unit, location, shift_type, employer:profiles!employer_id(company_name, avatar_url))').eq('student_id', studentId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getJobApplications(jobId) {
  const sb = await getClient();
  const { data, error } = await sb.from('applications').select('*, student:profiles!student_id(full_name, avatar_url, college, course, skills, verification_status)').eq('job_id', jobId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getEmployerApplications(employerId) {
  const sb = await getClient();
  const { data, error } = await sb.from('applications').select('*, student:profiles!student_id(full_name, avatar_url, college, course, skills, verification_status), job:jobs!job_id(title)').eq('job:employer_id', employerId).order('created_at', { ascending: false });
  if (error) { /* fallback */ }
  // Fallback: get via jobs
  const jobs = await getEmployerJobs(employerId);
  const jobIds = jobs.map(j => j.id);
  if (!jobIds.length) return [];
  const { data: apps, error: err2 } = await sb.from('applications').select('*, student:profiles!student_id(full_name, avatar_url, college, course, skills, verification_status), job:jobs!job_id(title)').in('job_id', jobIds).order('created_at', { ascending: false });
  if (err2) throw err2;
  return apps || [];
}

export async function createApplication(appData) {
  const sb = await getClient();
  const { data, error } = await sb.from('applications').insert(appData).select().single();
  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(appId, status) {
  const sb = await getClient();
  const { data, error } = await sb.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', appId).select().single();
  if (error) throw error;
  return data;
}

// ===================== VERIFICATIONS =====================
export async function createVerification(verData) {
  const sb = await getClient();
  const { data, error } = await sb.from('verifications').insert(verData).select().single();
  if (error) throw error;
  return data;
}

export async function updateVerification(verId, updates) {
  const sb = await getClient();
  const { data, error } = await sb.from('verifications').update(updates).eq('id', verId).select().single();
  if (error) throw error;
  return data;
}

// ===================== FILE UPLOAD =====================
export async function uploadFile(bucket, path, file) {
  const sb = await getClient();
  const { data, error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

// ===================== STATS (Employer) =====================
export async function getEmployerStats(employerId) {
  const sb = await getClient();
  const { count: jobCount } = await sb.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', employerId).eq('status', 'active');
  const jobs = await getEmployerJobs(employerId);
  const jobIds = jobs.map(j => j.id);
  let appCount = 0;
  if (jobIds.length) {
    const { count } = await sb.from('applications').select('*', { count: 'exact', head: true }).in('job_id', jobIds);
    appCount = count || 0;
  }
  return { activeJobs: jobCount || 0, totalApplicants: appCount };
}
