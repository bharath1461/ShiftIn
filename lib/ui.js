// ShiftIn — UI Utility helpers
export function showToast(message, type = 'info') {
  const existing = document.getElementById('shiftin-toast');
  if (existing) existing.remove();
  const colors = { info: 'var(--primary-container)', success: 'var(--secondary)', error: 'var(--error)', warning: 'var(--tertiary-container)' };
  const icons = { info: 'info', success: 'check_circle', error: 'error', warning: 'warning' };
  const toast = document.createElement('div');
  toast.id = 'shiftin-toast';
  Object.assign(toast.style, { position:'fixed',top:'24px',left:'50%',transform:'translateX(-50%)',zIndex:'999',background:colors[type],color:'#fff',padding:'12px 24px',borderRadius:'var(--radius-full)',display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',fontWeight:'600',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',animation:'slideUp 0.3s ease-out',maxWidth:'90vw' });
  toast.innerHTML = `<span class="material-symbols-outlined icon-filled" style="font-size:20px">${icons[type]}</span>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

export function showLoader(el, message = 'Loading...') {
  el.innerHTML = `<div class="page" style="justify-content:center;align-items:center;gap:16px"><div style="width:48px;height:48px;border:3px solid var(--surface-container-highest);border-top-color:var(--primary-container);border-radius:50%;animation:spin 0.8s linear infinite"></div><p class="text-body-md text-on-surface-variant">${message}</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
}

export function timeAgo(dateStr) {
  const now = Date.now(), d = new Date(dateStr).getTime(), diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function formatPay(amount, unit) {
  if (!amount) return 'N/A';
  const sym = amount >= 100 ? '₹' : '$';
  return `${sym}${Number(amount).toFixed(2)}/${unit || 'hr'}`;
}
