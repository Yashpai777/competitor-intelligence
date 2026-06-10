function showToast(message, type = 'info') {
  const icons = {
    success: '<svg style="color:#16a34a;flex-shrink:0;width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke-width="2" stroke-linecap="round"/></svg>',
    error: '<svg style="color:#dc2626;flex-shrink:0;width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/></svg>',
    info: '<svg style="color:#2563eb;flex-shrink:0;width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/></svg>',
  };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function timeAgo(dateStr) {
  if (!dateStr) return 'N/A';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function threatColor(score) {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#eab308';
  return '#22c55e';
}

function severityBadge(severity) {
  return `<span class="badge badge-${severity}">${severity}</span>`;
}

function getInitials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function companyLogoHtml(name, website) {
  const initials = getInitials(name);
  if (website) {
    try {
      const domain = new URL(website).hostname;
      return `<div class="company-logo"><img src="https://logo.clearbit.com/${domain}" alt="${name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${initials}</span></div>`;
    } catch {}
  }
  return `<div class="company-logo" style="display:flex;align-items:center;justify-content:center">${initials}</div>`;
}

function skeletonLines(n = 3, widths = []) {
  return Array.from({ length: n }, (_, i) => {
    const w = widths[i] || (80 - i * 10);
    return `<div class="skeleton" style="height:14px;width:${w}%;margin-bottom:10px"></div>`;
  }).join('');
}

function spinner(size = 16) {
  return `<svg class="spin" width="${size}" height="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
}

function emptyState(icon, title, subtitle = '') {
  return `<div style="text-align:center;padding:3rem 1rem;color:#94a3b8">${icon ? `<div style="font-size:2.5rem;margin-bottom:.75rem">${icon}</div>` : ''}<p style="font-size:.9375rem;font-weight:600;color:#64748b;margin-bottom:4px">${title}</p>${subtitle ? `<p style="font-size:.8125rem;color:#94a3b8">${subtitle}</p>` : ''}</div>`;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const TOPIC_COLORS = {
  'product-launch': 'background:#eff6ff;color:#2563eb',
  'funding': 'background:#f0fdf4;color:#16a34a',
  'hiring': 'background:#faf5ff;color:#7c3aed',
  'partnership': 'background:#fff7ed;color:#ea580c',
  'thought-leadership': 'background:#f8fafc;color:#475569',
  'customer-success': 'background:#ecfeff;color:#0891b2',
  'event': 'background:#fefce8;color:#ca8a04',
  'other': 'background:#f8fafc;color:#64748b',
};
function topicPill(topic) {
  const style = TOPIC_COLORS[topic] || TOPIC_COLORS['other'];
  return `<span style="${style};font-size:.6875rem;font-weight:600;padding:2px 8px;border-radius:9999px">${topic || 'other'}</span>`;
}
