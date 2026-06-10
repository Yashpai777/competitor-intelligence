const ReportsView = {
  async render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <div>
            <h1 style="font-size:1.125rem;font-weight:700;color:#0f172a">Weekly Reports</h1>
            <p style="font-size:.8125rem;color:#64748b;margin-top:2px">AI-generated executive summaries</p>
          </div>
          <button onclick="ReportsView.generateReport()" id="gen-btn" style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:#3b82f6;border:none;color:white;border-radius:8px;font-size:.8125rem;font-weight:500;cursor:pointer;box-shadow:0 1px 3px rgba(59,130,246,0.3)">✨ Generate Report</button>
        </div>
        <div id="reports-list"><div>${skeletonLines(6)}</div></div>
      </div>
    `;
    this.loadReports();
  },

  async loadReports() {
    const list = document.getElementById('reports-list');
    if (!list) return;
    try {
      const data = await API.reports.list();
      const reports = data.data || data;
      if (!reports?.length) { list.innerHTML = emptyState('📄', 'No reports yet', 'Generate your first weekly report'); return; }
      list.innerHTML = `<div style="display:flex;flex-direction:column;gap:.75rem">
        ${reports.map(r => `
          <div class="card" style="cursor:pointer" onclick="ReportsView.openReport('${r.id}')" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
              <div>
                <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:.25rem">Week of ${formatDate(r.weekStart)} — ${formatDate(r.weekEnd)}</p>
                ${r.company ? `<p style="font-size:.6875rem;color:#64748b;margin-bottom:.5rem">📊 ${r.company.name || r.company}</p>` : '<p style="font-size:.6875rem;color:#2563eb;margin-bottom:.5rem">🌐 All competitors</p>'}
                ${r.executiveSummary ? `<p style="font-size:.8125rem;color:#64748b;line-height:1.5">${r.executiveSummary.slice(0, 200)}${r.executiveSummary.length > 200 ? '…' : ''}</p>` : ''}
              </div>
              <span style="font-size:.6875rem;color:#94a3b8;flex-shrink:0">${timeAgo(r.createdAt)}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    } catch (e) {
      list.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`;
    }
  },

  async openReport(id) {
    try {
      const r = await API.reports.get(id);
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:1rem';
      modal.innerHTML = `
        <div style="background:white;border-radius:1rem;padding:1.75rem;max-width:720px;width:100%;max-height:82vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
            <p style="font-size:1rem;font-weight:700;color:#0f172a">Weekly Report — ${formatDate(r.weekStart)}</p>
            <button onclick="this.closest('[style*=fixed]').remove()" style="color:#94a3b8;background:none;border:none;cursor:pointer;font-size:1.25rem;line-height:1">✕</button>
          </div>
          ${r.executiveSummary ? `<div style="margin-bottom:1.25rem"><p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Executive Summary</p><p style="font-size:.875rem;color:#334155;line-height:1.7">${r.executiveSummary}</p></div>` : ''}
          ${r.strategicInsights ? `<div style="margin-bottom:1.25rem"><p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Strategic Insights</p><p style="font-size:.875rem;color:#334155;line-height:1.7">${r.strategicInsights}</p></div>` : ''}
          ${r.topThreats?.length ? `<div style="margin-bottom:1.25rem"><p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Top Threats</p><ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:.375rem">${r.topThreats.map(t => `<li style="font-size:.8125rem;color:#334155;display:flex;gap:8px;padding:.5rem .75rem;background:#fef2f2;border-radius:6px;border-left:2px solid #fca5a5">⚠️ ${t}</li>`).join('')}</ul></div>` : ''}
          ${r.keyOpportunities?.length ? `<div><p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Key Opportunities</p><ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:.375rem">${r.keyOpportunities.map(o => `<li style="font-size:.8125rem;color:#334155;display:flex;gap:8px;padding:.5rem .75rem;background:#f0fdf4;border-radius:6px;border-left:2px solid #86efac">✅ ${o}</li>`).join('')}</ul></div>` : ''}
        </div>
      `;
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
    } catch (e) { showToast('Failed to load report: ' + e.message, 'error'); }
  },

  async generateReport() {
    const btn = document.getElementById('gen-btn');
    if (btn) { btn.innerHTML = `${spinner(14)} Generating...`; btn.disabled = true; }
    try {
      await API.reports.generate();
      showToast('Report generation started — check back in a minute', 'success');
      setTimeout(() => this.loadReports(), 5000);
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.innerHTML = '✨ Generate Report'; btn.disabled = false; }
    }
  }
};
