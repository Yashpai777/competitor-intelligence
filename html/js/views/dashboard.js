const DashboardView = {
  charts: [],

  async render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <div>
            <h1 style="font-size:1.25rem;font-weight:700;color:#0f172a">Competitor Intelligence</h1>
            <p style="font-size:.8125rem;color:#64748b;margin-top:2px">AI Voice Agent market — real-time monitoring</p>
          </div>
          <button id="scrape-all-btn" onclick="DashboardView.scrapeAll()" style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:white;border:1px solid #e2e8f0;color:#374151;border-radius:8px;font-size:.8125rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
            <svg style="width:14px;height:14px;color:#3b82f6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23,4 23,11 16,11" stroke-width="2"/><polyline points="1,20 1,13 8,13" stroke-width="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 5.36A9 9 0 0 0 20.49 15" stroke-width="2"/></svg>
            Scrape All
          </button>
        </div>

        <!-- API offline banner placeholder -->
        <div id="api-banner"></div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.25rem" id="stats-row">
          ${[0,1,2,3].map(() => `<div class="stat-card"><div class="skeleton" style="height:12px;width:60%;margin-bottom:12px"></div><div class="skeleton" style="height:28px;width:40%"></div></div>`).join('')}
        </div>

        <!-- Grid: table + chart -->
        <div style="display:grid;grid-template-columns:1fr 360px;gap:1rem;margin-bottom:1rem">
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
              <p style="font-size:.875rem;font-weight:600;color:#0f172a">All Competitors</p>
              <span style="font-size:.6875rem;color:#94a3b8">sorted by threat score</span>
            </div>
            <table class="data-table">
              <thead><tr>
                <th>Company</th><th>Threat</th><th>Posts</th><th>News</th><th>Changes</th><th></th>
              </tr></thead>
              <tbody id="competitor-tbody">${Array(9).fill(`<tr><td colspan="6"><div class="skeleton" style="height:12px;width:90%"></div></td></tr>`).join('')}</tbody>
            </table>
          </div>
          <div class="card" style="display:flex;flex-direction:column">
            <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:1rem">Threat Scores</p>
            <div style="flex:1;min-height:260px;position:relative"><canvas id="threat-chart"></canvas></div>
          </div>
        </div>

        <!-- Bottom row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.875rem">
              <p style="font-size:.875rem;font-weight:600;color:#0f172a">Recent Alerts</p>
              <a href="#/alerts" style="font-size:.75rem;color:#3b82f6;text-decoration:none">View all →</a>
            </div>
            <div id="recent-alerts">${skeletonLines(4)}</div>
          </div>
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.875rem">
              <p style="font-size:.875rem;font-weight:600;color:#0f172a">Latest News</p>
              <span style="font-size:.6875rem;color:#94a3b8">all competitors</span>
            </div>
            <div id="latest-news">${skeletonLines(4)}</div>
          </div>
        </div>
      </div>
    `;

    this.charts.forEach(c => c.destroy());
    this.charts = [];

    try {
      const companies = await API.companies.list();
      document.getElementById('api-banner').innerHTML = '';
      this.renderStats(companies);
      this.renderTable(companies);
      this.renderThreatChart(companies);
    } catch (e) {
      document.getElementById('api-banner').innerHTML = `
        <div class="setup-banner" style="margin-bottom:1.25rem">
          <svg style="width:20px;height:20px;color:#d97706;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="3"/></svg>
          <div style="flex:1">
            <p style="font-size:.875rem;font-weight:600;color:#92400e">API not connected</p>
            <p style="font-size:.8125rem;color:#a16207;margin-top:2px">Your frontend is live but needs to know where your backend API is hosted. <a href="#/settings" style="color:#2563eb;font-weight:500">Go to Settings →</a> and enter your API URL.</p>
          </div>
        </div>`;
      document.getElementById('stats-row').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:1.5rem;color:#94a3b8;font-size:.875rem">Waiting for API connection…</div>`;
      document.getElementById('competitor-tbody').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#94a3b8;font-size:.875rem">No data — connect your API first</td></tr>`;
    }

    try {
      const alerts = await API.alerts.list({ limit: 5 });
      this.renderAlerts(alerts.data || alerts);
    } catch { document.getElementById('recent-alerts').innerHTML = this._empty('No alerts yet'); }

    try {
      const comps = await API.companies.list();
      const results = await Promise.all(comps.slice(0, 4).map(c => API.news.getArticles(c.slug, { limit: 2 }).catch(() => ({ data: [] }))));
      this.renderNews(results.flatMap(r => r.data || r).slice(0, 6));
    } catch { document.getElementById('latest-news').innerHTML = this._empty('No news yet'); }
  },

  _empty(msg) {
    return `<p style="text-align:center;padding:1.5rem;font-size:.8125rem;color:#94a3b8">${msg}</p>`;
  },

  renderStats(companies) {
    const total = companies.length;
    const avgThreat = Math.round(companies.reduce((s, c) => s + (c.threatScore || 0), 0) / total);
    const critical = companies.filter(c => c.threatScore >= 80).length;
    const active = companies.filter(c => c.isActive).length;
    document.getElementById('stats-row').innerHTML = `
      ${this._stat('Competitors Tracked', total, '#3b82f6', '📊')}
      ${this._stat('Avg Threat Score', avgThreat + '/100', '#f97316', '⚡')}
      ${this._stat('Critical Threats', critical, '#ef4444', '🔴')}
      ${this._stat('Active Monitors', active, '#22c55e', '✅')}
    `;
  },

  _stat(label, value, color, icon) {
    return `<div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem">
        <p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em">${label}</p>
        <span style="font-size:1.125rem">${icon}</span>
      </div>
      <p style="font-size:1.75rem;font-weight:800;color:#0f172a">${value}</p>
    </div>`;
  },

  renderTable(companies) {
    const sorted = [...companies].sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));
    document.getElementById('competitor-tbody').innerHTML = sorted.map(c => `
      <tr style="cursor:pointer" onclick="App.navigate('/competitor/${c.slug}/overview')">
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            ${companyLogoHtml(c.name, c.website)}
            <div>
              <p style="font-weight:600;color:#0f172a;font-size:.8125rem">${c.name}</p>
              <p style="font-size:.6875rem;color:#94a3b8">${(c.website || '').replace('https://','')}</p>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-weight:700;color:${threatColor(c.threatScore)};font-size:.875rem">${c.threatScore || 0}</span>
            <div class="threat-bar" style="width:52px"><div class="threat-fill" style="width:${c.threatScore || 0}%;background:${threatColor(c.threatScore)}"></div></div>
          </div>
        </td>
        <td style="color:#475569">${c._count?.linkedInPosts || '—'}</td>
        <td style="color:#475569">${c._count?.newsArticles || '—'}</td>
        <td style="color:#475569">${c._count?.websiteChanges || '—'}</td>
        <td><svg style="width:14px;height:14px;color:#cbd5e1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" stroke-width="2"/></svg></td>
      </tr>
    `).join('');
  },

  renderThreatChart(companies) {
    const sorted = [...companies].sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));
    const ctx = document.getElementById('threat-chart');
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sorted.map(c => c.name.split(' ')[0]),
        datasets: [{
          data: sorted.map(c => c.threatScore || 0),
          backgroundColor: sorted.map(c => threatColor(c.threatScore) + '22'),
          borderColor: sorted.map(c => threatColor(c.threatScore)),
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } }, max: 100 },
        }
      }
    });
    this.charts.push(chart);
  },

  renderAlerts(alerts) {
    if (!alerts?.length) { document.getElementById('recent-alerts').innerHTML = this._empty('No alerts yet'); return; }
    document.getElementById('recent-alerts').innerHTML = alerts.slice(0, 5).map(a => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:.5rem 0;border-bottom:1px solid #f1f5f9">
        ${severityBadge(a.severity)}
        <div style="flex:1;min-width:0">
          <p style="font-size:.8125rem;font-weight:500;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.title}</p>
          <p style="font-size:.6875rem;color:#94a3b8;margin-top:2px">${a.company?.name || ''} · ${timeAgo(a.createdAt)}</p>
        </div>
      </div>
    `).join('');
  },

  renderNews(articles) {
    if (!articles?.length) { document.getElementById('latest-news').innerHTML = this._empty('No news yet'); return; }
    document.getElementById('latest-news').innerHTML = articles.map(a => `
      <div style="padding:.5rem 0;border-bottom:1px solid #f1f5f9">
        <div style="display:flex;gap:6px;margin-bottom:3px">
          <span style="font-size:.6875rem;color:#64748b;background:#f1f5f9;padding:1px 6px;border-radius:4px">${a.source || 'News'}</span>
          <span style="font-size:.6875rem;color:#94a3b8">${timeAgo(a.publishedAt)}</span>
        </div>
        <a href="${a.url}" target="_blank" style="font-size:.8125rem;font-weight:500;color:#1e293b;text-decoration:none;line-height:1.4;display:block" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#1e293b'">${a.title}</a>
      </div>
    `).join('');
  },

  async scrapeAll() {
    const btn = document.getElementById('scrape-all-btn');
    if (btn) { btn.innerHTML = `${spinner(14)} Queuing...`; btn.disabled = true; }
    try {
      await API.scraping.triggerLinkedInAll();
      showToast('All LinkedIn scraping jobs queued!', 'success');
    } catch (e) {
      showToast('Scrape failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.innerHTML = `<svg style="width:14px;height:14px;color:#3b82f6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23,4 23,11 16,11" stroke-width="2"/><polyline points="1,20 1,13 8,13" stroke-width="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 5.36A9 9 0 0 0 20.49 15" stroke-width="2"/></svg> Scrape All`; btn.disabled = false; }
    }
  }
};
