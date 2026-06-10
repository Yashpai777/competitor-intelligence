const App = {
  async init() {
    document.getElementById('header-search')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        this.navigate('/search?q=' + encodeURIComponent(e.target.value.trim()));
      }
    });
    await this.loadCompetitorNav();
    this.updateAlertBadge();
    setInterval(() => this.updateAlertBadge(), 60000);
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  replaceHash(hash) {
    history.replaceState(null, '', '#' + hash);
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  async loadCompetitorNav() {
    const nav = document.getElementById('competitor-nav');
    if (!nav) return;
    try {
      const companies = await API.companies.list();
      nav.innerHTML = companies.map(c => `
        <a href="#/competitor/${c.slug}/overview" class="nav-item" data-slug="${c.slug}" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:6px;font-size:.8125rem;font-weight:500;color:#94a3b8;text-decoration:none;margin-bottom:2px;transition:all .15s">
          <div style="width:6px;height:6px;border-radius:50%;background:${threatColor(c.threatScore)};flex-shrink:0"></div>
          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</span>
          <span style="font-size:.625rem;color:${threatColor(c.threatScore)};font-weight:700">${c.threatScore || 0}</span>
        </a>
      `).join('');
    } catch {
      nav.innerHTML = `<div style="padding:.75rem 12px;font-size:.75rem;color:#475569">API offline — go to Settings</div>`;
    }
  },

  async updateAlertBadge() {
    try {
      const data = await API.alerts.unreadCount();
      const count = data.count || 0;
      const badge = document.getElementById('alert-badge');
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 9 ? '9+' : count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch {}
  },

  updateNavActive(routeKey) {
    document.querySelectorAll('.nav-item[data-route]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-slug]').forEach(el => el.classList.remove('competitor-active'));
    const active = document.querySelector(`.nav-item[data-route="${routeKey}"]`);
    if (active) active.classList.add('active');
  },

  updateCompNavActive(slug) {
    document.querySelectorAll('.nav-item[data-route]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-slug]').forEach(el => {
      el.classList.remove('competitor-active');
      if (el.dataset.slug === slug) el.classList.add('competitor-active');
    });
  },

  route() {
    const hash = window.location.hash.slice(1) || '/dashboard';
    const content = document.getElementById('page-content');
    if (!content) return;

    const compMatch = hash.match(/^\/competitor\/([^/?]+)(?:\/([^?]*))?/);
    if (compMatch) {
      this.updateCompNavActive(compMatch[1]);
      CompetitorView.render(content, compMatch[1], compMatch[2] || 'overview');
      return;
    }
    if (hash.startsWith('/search')) {
      this.updateNavActive('search');
      const params = new URLSearchParams(hash.split('?')[1]);
      SearchView.render(content, params.get('q') || '');
      return;
    }
    if (hash.startsWith('/alerts')) { this.updateNavActive('alerts'); AlertsView.render(content); return; }
    if (hash.startsWith('/reports')) { this.updateNavActive('reports'); ReportsView.render(content); return; }
    if (hash.startsWith('/settings')) { this.updateNavActive('settings'); SettingsView.render(content); return; }

    this.updateNavActive('dashboard');
    DashboardView.render(content);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
