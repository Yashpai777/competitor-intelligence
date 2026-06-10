const SettingsView = {
  render(container) {
    const currentUrl = window.APP_CONFIG.API_URL;
    container.innerHTML = `
      <div class="fade-in" style="max-width:640px">
        <h1 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin-bottom:.375rem">Settings</h1>
        <p style="font-size:.8125rem;color:#64748b;margin-bottom:1.75rem">Configure your CompeteIQ API backend connection</p>

        <div class="card" style="margin-bottom:1rem">
          <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:1rem">API Connection</p>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:.625rem;padding:.875rem;margin-bottom:1rem">
            <p style="font-size:.8125rem;font-weight:600;color:#92400e;margin-bottom:.25rem">⚡ Setup Required</p>
            <p style="font-size:.8125rem;color:#a16207;line-height:1.5">Enter the URL of your hosted NestJS API below. If running locally use <code style="background:#fef3c7;padding:1px 5px;border-radius:3px">http://localhost:3001</code>. For production, deploy your API to Railway, Render, or Fly.io and paste the URL here.</p>
          </div>

          <div style="margin-bottom:1rem">
            <label style="font-size:.8125rem;font-weight:500;color:#334155;display:block;margin-bottom:.5rem">API Base URL</label>
            <input id="api-url-input" class="settings-input" type="text" value="${currentUrl}" placeholder="https://your-api.railway.app" />
            <p style="font-size:.6875rem;color:#94a3b8;margin-top:.375rem">This is saved in your browser — you'll only need to set it once per device.</p>
          </div>

          <div style="display:flex;align-items:center;gap:.75rem">
            <button onclick="SettingsView.saveApiUrl()" style="padding:8px 18px;background:#3b82f6;border:none;color:white;border-radius:8px;font-size:.8125rem;font-weight:500;cursor:pointer;box-shadow:0 1px 3px rgba(59,130,246,0.3)">Save & Test Connection</button>
            <span id="conn-status" style="font-size:.8125rem;color:#64748b"></span>
          </div>
        </div>

        <div class="card" style="margin-bottom:1rem">
          <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:.75rem">Quick Actions</p>
          <button onclick="SettingsView.triggerScrapeAll()" style="text-align:left;width:100%;padding:.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;color:#334155;border-radius:.5rem;font-size:.8125rem;cursor:pointer;display:flex;align-items:center;gap:.5rem" onmouseover="this.style.borderColor='#cbd5e1'" onmouseout="this.style.borderColor='#e2e8f0'">
            <svg style="width:14px;height:14px;color:#3b82f6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23,4 23,11 16,11" stroke-width="2"/><polyline points="1,20 1,13 8,13" stroke-width="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 5.36A9 9 0 0 0 20.49 15" stroke-width="2"/></svg>
            Trigger LinkedIn scrape for all competitors
          </button>
        </div>

        <div class="card">
          <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:.75rem">About</p>
          <p style="font-size:.8125rem;color:#64748b;line-height:1.6">CompeteIQ monitors 9 AI Voice Agent competitors — Parloa, Cognigy, Bland AI, Vapi, Retell AI, Air AI, Synthflow, Fonio.ai, and ElevenLabs — tracking LinkedIn posts via Apify, website changes, and news automatically.</p>
          <div style="margin-top:.875rem;padding:.75rem;background:#f8fafc;border-radius:.5rem;border:1px solid #e2e8f0;font-size:.6875rem;color:#94a3b8">
            <p>Stack: NestJS API + PostgreSQL + Redis/BullMQ + Anthropic Claude</p>
            <p style="margin-top:.25rem">LinkedIn: Apify actors (anchor-scraper + curious_coder)</p>
          </div>
        </div>
      </div>
    `;
  },

  async saveApiUrl() {
    const url = document.getElementById('api-url-input')?.value?.trim();
    if (!url) return;
    const status = document.getElementById('conn-status');
    status.innerHTML = `${spinner(12)} Testing...`;
    try {
      window.APP_CONFIG.API_URL = url;
      localStorage.setItem('api_url', url);
      await API.companies.list();
      status.innerHTML = '<span style="color:#16a34a">✓ Connected successfully!</span>';
      showToast('API URL saved and connected', 'success');
      App.loadCompetitorNav();
    } catch (e) {
      status.innerHTML = `<span style="color:#dc2626">✗ ${e.message}</span>`;
      showToast('Connection failed — check the URL and make sure your API is running', 'error');
    }
  },

  async triggerScrapeAll() {
    try {
      await API.scraping.triggerLinkedInAll();
      showToast('All LinkedIn scraping jobs queued!', 'success');
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
    }
  }
};
