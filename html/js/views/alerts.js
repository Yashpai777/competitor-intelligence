const AlertsView = {
  currentSev: 'all',

  async render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <div>
            <h1 style="font-size:1.125rem;font-weight:700;color:#0f172a">Alerts</h1>
            <p style="font-size:.8125rem;color:#64748b;margin-top:2px">High-priority competitor activity</p>
          </div>
          <button onclick="AlertsView.markAllRead()" style="padding:6px 14px;background:white;border:1px solid #e2e8f0;color:#374151;border-radius:8px;font-size:.8125rem;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04)">Mark all read</button>
        </div>
        <div style="display:flex;gap:.5rem;margin-bottom:1rem">
          ${['all','critical','high','medium','low'].map(s => `<button onclick="AlertsView.filterSeverity('${s}')" class="tab-btn ${s === 'all' ? 'active' : ''}" data-sev="${s}" style="padding:4px 12px;font-size:.75rem">${s.charAt(0).toUpperCase() + s.slice(1)}</button>`).join('')}
        </div>
        <div id="alerts-list"><div>${skeletonLines(6)}</div></div>
      </div>
    `;
    this.loadAlerts();
  },

  filterSeverity(sev) {
    this.currentSev = sev;
    document.querySelectorAll('[data-sev]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-sev="${sev}"]`)?.classList.add('active');
    this.loadAlerts();
  },

  async loadAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    try {
      const params = { limit: 50 };
      if (this.currentSev !== 'all') params.severity = this.currentSev;
      const data = await API.alerts.list(params);
      const alerts = data.data || data;
      if (!alerts?.length) { list.innerHTML = emptyState('🔔', 'No alerts', 'All clear!'); return; }
      list.innerHTML = `<div style="display:flex;flex-direction:column;gap:.5rem">
        ${alerts.map(a => `
          <div class="card" style="padding:.875rem;${!a.isRead ? 'border-left:3px solid #3b82f6' : ''}" id="alert-${a.id}">
            <div style="display:flex;align-items:flex-start;gap:.75rem">
              ${severityBadge(a.severity)}
              <div style="flex:1;min-width:0">
                <p style="font-size:.875rem;font-weight:${a.isRead ? '400' : '600'};color:${a.isRead ? '#64748b' : '#0f172a'};margin-bottom:.25rem">${a.title}</p>
                ${a.message ? `<p style="font-size:.8125rem;color:#64748b;line-height:1.5;margin-bottom:.375rem">${a.message}</p>` : ''}
                <div style="display:flex;gap:.75rem">
                  ${a.company ? `<span style="font-size:.6875rem;color:#94a3b8">📊 ${a.company.name || a.company}</span>` : ''}
                  <span style="font-size:.6875rem;color:#94a3b8">${timeAgo(a.createdAt)}</span>
                </div>
              </div>
              ${!a.isRead ? `<button onclick="AlertsView.markRead('${a.id}')" style="flex-shrink:0;padding:4px 10px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;border-radius:6px;font-size:.6875rem;cursor:pointer">Mark read</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>`;
    } catch (e) {
      list.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`;
    }
  },

  async markRead(id) {
    try {
      await API.alerts.markRead(id);
      this.loadAlerts();
      App.updateAlertBadge();
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  },

  async markAllRead() {
    try {
      await API.alerts.markAllRead();
      showToast('All alerts marked as read', 'success');
      this.loadAlerts();
      App.updateAlertBadge();
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  }
};
