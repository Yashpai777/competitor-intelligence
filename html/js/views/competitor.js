const CompetitorView = {
  charts: [],
  currentSlug: null,
  currentTab: 'overview',

  async render(container, slug, tab = 'overview') {
    this.currentSlug = slug;
    this.currentTab = tab;
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    container.innerHTML = `<div class="fade-in">${skeletonLines(4, [100, 90, 80, 70])}</div>`;

    try {
      const company = await API.companies.get(slug);
      this.renderShell(container, company, tab);
      this.renderTab(tab, slug, company);
    } catch (e) {
      container.innerHTML = `<div style="color:#dc2626;font-size:.8125rem;padding:1rem">${e.message}</div>`;
    }
  },

  renderShell(container, company, activeTab) {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
      { id: 'website', label: 'Website', icon: '🌐' },
      { id: 'news', label: 'News', icon: '📰' },
      { id: 'battlecard', label: 'Battlecard', icon: '⚔️' },
    ];

    container.innerHTML = `
      <div class="fade-in">
        <!-- Header -->
        <div class="card" style="margin-bottom:.75rem">
          <div style="display:flex;align-items:flex-start;gap:1rem">
            <div style="width:52px;height:52px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
              ${company.website ? `<img src="https://logo.clearbit.com/${new URL(company.website).hostname}" style="width:36px;height:36px;object-fit:contain" onerror="this.style.display='none'" />` : ''}
              <span style="font-weight:700;font-size:.9375rem;color:#64748b">${getInitials(company.name)}</span>
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:.625rem;flex-wrap:wrap">
                <h1 style="font-size:1.0625rem;font-weight:700;color:#0f172a">${company.name}</h1>
                <span style="font-size:.6875rem;font-weight:600;padding:2px 10px;border-radius:9999px;background:${threatColor(company.threatScore)}18;color:${threatColor(company.threatScore)};border:1px solid ${threatColor(company.threatScore)}33">${company.threatScore || 0}/100 Threat</span>
                ${company.headquarters ? `<span style="font-size:.6875rem;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:9999px">📍 ${company.headquarters}</span>` : ''}
              </div>
              <p style="font-size:.8125rem;color:#64748b;margin-top:4px;line-height:1.5">${company.description || ''}</p>
            </div>
            <div style="display:flex;align-items:center;gap:.5rem;flex-shrink:0">
              <button onclick="CompetitorView.scrapeNow('${company.slug}')" id="scrape-btn" style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:white;border:1px solid #e2e8f0;color:#374151;border-radius:8px;font-size:.75rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04)">
                <svg style="width:12px;height:12px;color:#3b82f6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23,4 23,11 16,11" stroke-width="2"/><polyline points="1,20 1,13 8,13" stroke-width="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 5.36A9 9 0 0 0 20.49 15" stroke-width="2"/></svg>
                Scrape Now
              </button>
              ${company.website ? `<a href="${company.website}" target="_blank" style="padding:6px;border:1px solid #e2e8f0;border-radius:8px;color:#64748b;display:flex;background:white" title="Website"><svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="2" y1="12" x2="22" y2="12" stroke-width="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2"/></svg></a>` : ''}
              ${company.linkedinUrl ? `<a href="${company.linkedinUrl}" target="_blank" style="padding:6px;border:1px solid #e2e8f0;border-radius:8px;color:#64748b;display:flex;background:white"><svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke-width="2"/><rect x="2" y="9" width="4" height="12" stroke-width="2"/><circle cx="4" cy="4" r="2" stroke-width="2"/></svg></a>` : ''}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:.25rem;background:white;border:1px solid #e2e8f0;border-radius:.75rem;padding:.25rem;margin-bottom:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
          ${tabs.map(t => `<button onclick="CompetitorView.switchTab('${t.id}')" id="tab-${t.id}" class="tab-btn ${activeTab === t.id ? 'active' : ''}" style="flex:1">${t.icon} ${t.label}</button>`).join('')}
        </div>

        <div id="tab-content"></div>
      </div>
    `;

    this.renderTab(activeTab, company.slug, company);
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tab-' + tab);
    if (btn) btn.classList.add('active');
    App.replaceHash(`/competitor/${this.currentSlug}/${tab}`);
    this.renderTab(tab, this.currentSlug);
  },

  async renderTab(tab, slug) {
    const tc = document.getElementById('tab-content');
    if (!tc) return;
    tc.innerHTML = `<div>${skeletonLines(5, [100, 90, 80, 70, 60])}</div>`;
    switch (tab) {
      case 'overview': return this.renderOverview(slug);
      case 'linkedin': return this.renderLinkedIn(slug);
      case 'website': return this.renderWebsite(slug);
      case 'news': return this.renderNews(slug);
      case 'battlecard': return this.renderBattlecard(slug);
    }
  },

  async renderOverview(slug) {
    const tc = document.getElementById('tab-content');
    try {
      const [company, stats] = await Promise.all([
        API.companies.get(slug),
        API.companies.stats(slug).catch(() => null)
      ]);
      tc.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1rem">
          ${this._mini('LinkedIn Posts', stats?.totalLinkedInPosts || 0, '💼')}
          ${this._mini('News Articles', stats?.totalNewsArticles || 0, '📰')}
          ${this._mini('Website Changes', stats?.totalWebsiteChanges || 0, '🌐')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="card">
            <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:.875rem">Company Details</p>
            ${this._detail('Founded', company.founded)}
            ${this._detail('Employees', company.employeeCount)}
            ${this._detail('HQ', company.headquarters)}
            ${this._detail('Funding', company.fundingStage)}
            ${this._detail('Pricing', company.pricingModel)}
          </div>
          <div class="card">
            <p style="font-size:.875rem;font-weight:600;color:#0f172a;margin-bottom:.875rem">Threat Analysis</p>
            <div style="margin-bottom:1rem">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:.75rem;color:#64748b">Threat Score</span>
                <span style="font-size:.875rem;font-weight:700;color:${threatColor(company.threatScore)}">${company.threatScore || 0}/100</span>
              </div>
              <div class="threat-bar"><div class="threat-fill" style="width:${company.threatScore || 0}%;background:${threatColor(company.threatScore)}"></div></div>
            </div>
            ${company.description ? `<p style="font-size:.8125rem;color:#64748b;line-height:1.6">${company.description}</p>` : ''}
          </div>
        </div>
      `;
    } catch (e) {
      tc.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`;
    }
  },

  _mini(label, value, icon) {
    return `<div class="stat-card">
      <p style="font-size:.6875rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">${icon} ${label}</p>
      <p style="font-size:1.5rem;font-weight:800;color:#0f172a">${formatNumber(value)}</p>
    </div>`;
  },

  _detail(label, value) {
    if (!value) return '';
    return `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #f1f5f9">
      <span style="font-size:.8125rem;color:#94a3b8">${label}</span>
      <span style="font-size:.8125rem;color:#1e293b;font-weight:500">${value}</span>
    </div>`;
  },

  async renderLinkedIn(slug) {
    const tc = document.getElementById('tab-content');
    try {
      const data = await API.linkedin.getPosts(slug, { limit: 20 });
      const posts = data.data || data;
      if (!posts?.length) { tc.innerHTML = emptyState('💼', 'No LinkedIn posts yet', 'Run a scrape to collect posts'); return; }
      tc.innerHTML = `
        <div style="margin-bottom:.875rem;display:flex;align-items:center;justify-content:space-between">
          <p style="font-size:.875rem;font-weight:600;color:#0f172a">${posts.length} posts collected</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          ${posts.map(p => `
            <div class="post-card">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;margin-bottom:.5rem">
                <div style="display:flex;gap:.375rem;flex-wrap:wrap">${topicPill(p.topicCategory)}${p.isViral ? '<span style="font-size:.6875rem;font-weight:600;color:#ea580c;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);padding:2px 8px;border-radius:9999px">🔥 Viral</span>' : ''}</div>
                <span style="font-size:.6875rem;color:#94a3b8;flex-shrink:0">${timeAgo(p.publishedAt)}</span>
              </div>
              <p style="font-size:.8125rem;color:#334155;line-height:1.6;margin-bottom:.625rem">${p.content ? p.content.slice(0, 300) + (p.content.length > 300 ? '…' : '') : ''}</p>
              <div style="display:flex;align-items:center;gap:1rem">
                <span style="font-size:.75rem;color:#64748b">👍 ${formatNumber(p.likes)}</span>
                <span style="font-size:.75rem;color:#64748b">💬 ${formatNumber(p.comments)}</span>
                <span style="font-size:.75rem;color:#64748b">🔁 ${formatNumber(p.shares)}</span>
                ${p.url ? `<a href="${p.url}" target="_blank" style="margin-left:auto;font-size:.75rem;color:#2563eb;text-decoration:none">View →</a>` : ''}
              </div>
              ${p.aiPerformanceReason ? `<p style="font-size:.6875rem;color:#64748b;margin-top:.5rem;padding:.5rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;line-height:1.5">🤖 ${p.aiPerformanceReason}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) { tc.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`; }
  },

  async renderWebsite(slug) {
    const tc = document.getElementById('tab-content');
    try {
      const data = await API.website.getChanges(slug);
      const changes = data.data || data;
      if (!changes?.length) { tc.innerHTML = emptyState('🌐', 'No website changes detected', 'Run a scrape to check for changes'); return; }
      tc.innerHTML = `<div style="display:flex;flex-direction:column;gap:.75rem">
        ${changes.map(c => `
          <div class="card" style="padding:1rem">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;margin-bottom:.5rem">
              <div style="display:flex;gap:.375rem;flex-wrap:wrap">
                <span style="font-size:.6875rem;font-weight:500;color:#334155;background:#f1f5f9;padding:2px 8px;border-radius:4px">${c.pageType || 'page'}</span>
                <span style="font-size:.6875rem;font-weight:500;color:#2563eb;background:#eff6ff;padding:2px 8px;border-radius:4px">${c.changeType || 'change'}</span>
                ${c.importance >= 70 ? `<span class="badge badge-high">High Impact</span>` : c.importance >= 40 ? `<span class="badge badge-medium">Medium</span>` : `<span class="badge badge-low">Minor</span>`}
              </div>
              <span style="font-size:.6875rem;color:#94a3b8;flex-shrink:0">${timeAgo(c.detectedAt)}</span>
            </div>
            ${c.aiSummary ? `<p style="font-size:.8125rem;color:#334155;line-height:1.6">${c.aiSummary}</p>` : ''}
          </div>
        `).join('')}
      </div>`;
    } catch (e) { tc.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`; }
  },

  async renderNews(slug) {
    const tc = document.getElementById('tab-content');
    try {
      const data = await API.news.getArticles(slug, { limit: 20 });
      const articles = data.data || data;
      if (!articles?.length) { tc.innerHTML = emptyState('📰', 'No news yet', 'Run a scrape to collect news'); return; }
      tc.innerHTML = `<div style="display:flex;flex-direction:column;gap:.625rem">
        ${articles.map(a => `
          <div class="card" style="padding:1rem">
            <div style="display:flex;gap:.5rem;margin-bottom:.375rem;flex-wrap:wrap">
              <span style="font-size:.6875rem;color:#64748b;background:#f1f5f9;padding:1px 6px;border-radius:4px">${a.source || 'News'}</span>
              ${a.category ? `<span style="font-size:.6875rem;color:#94a3b8">${a.category}</span>` : ''}
              <span style="font-size:.6875rem;color:#94a3b8">${timeAgo(a.publishedAt)}</span>
            </div>
            <a href="${a.url}" target="_blank" style="font-size:.875rem;font-weight:500;color:#1e293b;text-decoration:none;line-height:1.5;display:block;margin-bottom:.375rem" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#1e293b'">${a.title}</a>
            ${a.summary ? `<p style="font-size:.8125rem;color:#64748b;line-height:1.5">${a.summary}</p>` : ''}
          </div>
        `).join('')}
      </div>`;
    } catch (e) { tc.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`; }
  },

  async renderBattlecard(slug) {
    const tc = document.getElementById('tab-content');
    try {
      const bc = await API.battlecard.get(slug);
      if (!bc) { tc.innerHTML = emptyState('⚔️', 'No battlecard yet', 'Click Regenerate to generate one'); return; }
      const objHandling = bc.objectionHandling || {};
      tc.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <p style="font-size:.875rem;font-weight:600;color:#0f172a">Sales Battlecard</p>
          <button onclick="CompetitorView.regenerateBattlecard('${slug}')" id="regen-btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:white;border:1px solid #e2e8f0;color:#374151;border-radius:8px;font-size:.75rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04)">✨ Regenerate</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div class="bc-section bc-green">
            <p style="font-size:.8125rem;font-weight:600;color:#16a34a;margin-bottom:.625rem">✅ Strengths</p>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.375rem">
              ${(bc.strengths || []).map(s => `<li style="font-size:.8125rem;color:#334155;display:flex;gap:6px"><span style="color:#16a34a;flex-shrink:0">•</span>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="bc-section bc-red">
            <p style="font-size:.8125rem;font-weight:600;color:#dc2626;margin-bottom:.625rem">❌ Weaknesses</p>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.375rem">
              ${(bc.weaknesses || []).map(w => `<li style="font-size:.8125rem;color:#334155;display:flex;gap:6px"><span style="color:#dc2626;flex-shrink:0">•</span>${w}</li>`).join('')}
            </ul>
          </div>
        </div>
        ${bc.howWeCompare?.length ? `<div class="bc-section bc-blue" style="margin-bottom:1rem"><p style="font-size:.8125rem;font-weight:600;color:#2563eb;margin-bottom:.625rem">⚔️ How We Compare</p><div style="display:flex;flex-direction:column;gap:.375rem">${bc.howWeCompare.map((c,i) => `<div style="display:flex;gap:8px;font-size:.8125rem;color:#334155"><span style="color:#2563eb;font-weight:600;min-width:16px">${i+1}.</span>${c}</div>`).join('')}</div></div>` : ''}
        ${Object.keys(objHandling).length ? `<div class="bc-section bc-yellow" style="margin-bottom:1rem"><p style="font-size:.8125rem;font-weight:600;color:#ca8a04;margin-bottom:.75rem">💬 Objection Handling</p><div style="display:flex;flex-direction:column;gap:.75rem">${Object.entries(objHandling).map(([q,a]) => `<div><p style="font-size:.75rem;font-weight:500;color:#92400e;margin-bottom:.25rem">"${q}"</p><p style="font-size:.8125rem;color:#334155;padding:.5rem;background:rgba(255,255,255,0.7);border-radius:6px;line-height:1.5">${a}</p></div>`).join('')}</div></div>` : ''}
        ${bc.talkingPoints?.length ? `<div class="card" style="margin-bottom:1rem"><p style="font-size:.8125rem;font-weight:600;color:#0f172a;margin-bottom:.625rem">🎯 Talking Points</p><div style="display:flex;flex-direction:column;gap:.375rem">${bc.talkingPoints.map((t,i) => `<div style="display:flex;gap:8px;font-size:.8125rem;color:#334155"><span style="color:#94a3b8;font-weight:600;min-width:16px">${i+1}.</span>${t}</div>`).join('')}</div></div>` : ''}
        ${bc.positioningRecommendations?.length ? `<div class="card"><p style="font-size:.8125rem;font-weight:600;color:#0f172a;margin-bottom:.625rem">🏆 Positioning</p><div style="display:flex;flex-direction:column;gap:.375rem">${bc.positioningRecommendations.map(r => `<p style="font-size:.8125rem;color:#334155;padding:.375rem .625rem;background:#f8fafc;border-radius:6px;border-left:2px solid #e2e8f0">${r}</p>`).join('')}</div></div>` : ''}
      `;
    } catch (e) { tc.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`; }
  },

  async regenerateBattlecard(slug) {
    const btn = document.getElementById('regen-btn');
    if (btn) { btn.innerHTML = `${spinner(12)} Generating...`; btn.disabled = true; }
    try {
      await API.battlecard.regenerate(slug);
      showToast('Battlecard regeneration started!', 'success');
      setTimeout(() => this.renderBattlecard(slug), 3000);
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
      if (btn) { btn.innerHTML = '✨ Regenerate'; btn.disabled = false; }
    }
  },

  async scrapeNow(slug) {
    const btn = document.getElementById('scrape-btn');
    if (btn) { btn.innerHTML = `${spinner(12)} Queuing...`; btn.disabled = true; }
    try {
      await API.scraping.triggerAll(slug);
      showToast('Scrape jobs queued — LinkedIn, website & news!', 'success');
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.innerHTML = `<svg style="width:12px;height:12px;color:#3b82f6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23,4 23,11 16,11" stroke-width="2"/><polyline points="1,20 1,13 8,13" stroke-width="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 5.36A9 9 0 0 0 20.49 15" stroke-width="2"/></svg> Scrape Now`; btn.disabled = false; }
    }
  }
};
