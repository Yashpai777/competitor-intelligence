const SearchView = {
  currentType: 'all',

  async render(container, query = '') {
    container.innerHTML = `
      <div class="fade-in">
        <h1 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin-bottom:.875rem">Search</h1>
        <div style="position:relative;max-width:580px;margin-bottom:.875rem">
          <svg style="position:absolute;left:11px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:#94a3b8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/></svg>
          <input id="search-input" type="text" value="${query}" placeholder="Search news, LinkedIn posts, website changes..." style="width:100%;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:9px 12px 9px 34px;font-size:.875rem;color:#0f172a;font-family:'Inter',sans-serif;box-shadow:0 1px 2px rgba(0,0,0,0.04)" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'" />
        </div>
        <div style="display:flex;gap:.375rem;margin-bottom:1.25rem">
          ${['all','news','linkedin','website'].map(t => `<button onclick="SearchView.filterType('${t}')" class="tab-btn ${t === 'all' ? 'active' : ''}" data-type="${t}" style="padding:4px 12px;font-size:.75rem">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
        <div id="search-results">${query ? `<div>${skeletonLines(5)}</div>` : this.emptyPrompt()}</div>
      </div>
    `;
    document.getElementById('search-input').addEventListener('input', debounce((e) => {
      const q = e.target.value.trim();
      if (q.length > 2) this.runSearch(q);
      else if (!q) document.getElementById('search-results').innerHTML = this.emptyPrompt();
    }, 400));
    if (query) this.runSearch(query);
  },

  filterType(type) {
    this.currentType = type;
    document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
    const q = document.getElementById('search-input')?.value?.trim();
    if (q?.length > 2) this.runSearch(q);
  },

  emptyPrompt() {
    return `<div style="text-align:center;padding:4rem 1rem;color:#94a3b8">
      <div style="font-size:3rem;margin-bottom:.875rem">🔍</div>
      <p style="font-size:.9375rem;font-weight:600;color:#64748b">Search everything</p>
      <p style="font-size:.8125rem;margin-top:.25rem">Type at least 3 characters to search across all competitors</p>
    </div>`;
  },

  async runSearch(q) {
    const res = document.getElementById('search-results');
    res.innerHTML = `<div style="padding:.75rem;color:#64748b;font-size:.8125rem;display:flex;align-items:center;gap:.5rem">${spinner(14)} Searching...</div>`;
    try {
      const data = await API.search.query(q, this.currentType === 'all' ? undefined : this.currentType);
      const results = data.results || data;
      if (!results?.length) { res.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8;font-size:.875rem">No results for "<strong style="color:#334155">${q}</strong>"</div>`; return; }
      res.innerHTML = `
        <p style="font-size:.8125rem;color:#64748b;margin-bottom:.875rem">${results.length} result${results.length !== 1 ? 's' : ''} for "<strong style="color:#0f172a">${q}</strong>"</p>
        <div style="display:flex;flex-direction:column;gap:.625rem">
          ${results.map(r => this.resultCard(r, q)).join('')}
        </div>
      `;
    } catch (e) {
      res.innerHTML = `<div style="color:#dc2626;font-size:.8125rem">${e.message}</div>`;
    }
  },

  resultCard(r, q) {
    const typeColors = { news: '#2563eb', linkedin: '#0891b2', website: '#7c3aed' };
    const color = typeColors[r.type] || '#64748b';
    const highlight = (text) => text ? text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>') : '';
    return `<div class="card" style="padding:.875rem">
      <div style="display:flex;align-items:flex-start;gap:.75rem">
        <span style="font-size:.6875rem;font-weight:600;color:${color};background:${color}18;padding:2px 8px;border-radius:4px;flex-shrink:0;margin-top:1px">${r.type || 'result'}</span>
        <div style="flex:1;min-width:0">
          ${r.company ? `<p style="font-size:.6875rem;color:#94a3b8;margin-bottom:.25rem">${r.company}</p>` : ''}
          ${r.url
            ? `<a href="${r.url}" target="_blank" style="font-size:.875rem;font-weight:500;color:#1e293b;text-decoration:none;line-height:1.4;display:block;margin-bottom:.375rem" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#1e293b'">${highlight(r.title || (r.content || '').slice(0, 100))}</a>`
            : `<p style="font-size:.875rem;font-weight:500;color:#1e293b;line-height:1.4;margin-bottom:.375rem">${highlight(r.title || (r.content || '').slice(0, 100))}</p>`}
          ${(r.summary || r.content) ? `<p style="font-size:.8125rem;color:#64748b;line-height:1.5">${highlight((r.summary || r.content || '').slice(0, 200))}${((r.summary || r.content) || '').length > 200 ? '…' : ''}</p>` : ''}
          <p style="font-size:.6875rem;color:#94a3b8;margin-top:.375rem">${timeAgo(r.publishedAt || r.detectedAt || r.createdAt)}</p>
        </div>
      </div>
    </div>`;
  }
};
