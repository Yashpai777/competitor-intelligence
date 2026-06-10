const API = (() => {
  const base = () => window.APP_CONFIG.API_URL;
  async function req(method, path, body) {
    const res = await fetch(`${base()}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }
  const get = (path) => req('GET', path);
  const post = (path, body) => req('POST', path, body);
  return {
    companies: {
      list: () => get('/companies'),
      get: (slug) => get(`/companies/${slug}`),
      stats: (slug) => get(`/companies/${slug}/stats`),
    },
    linkedin: {
      getPosts: (slug, params = {}) => {
        const q = new URLSearchParams(params).toString();
        return get(`/linkedin/${slug}/posts${q ? '?' + q : ''}`);
      },
    },
    website: {
      getChanges: (slug) => get(`/website/${slug}/changes`),
    },
    news: {
      getArticles: (slug, params = {}) => {
        const q = new URLSearchParams(params).toString();
        return get(`/news/${slug}/articles${q ? '?' + q : ''}`);
      },
    },
    battlecard: {
      get: (slug) => get(`/battlecard/${slug}`),
      regenerate: (slug) => post(`/battlecard/${slug}/regenerate`),
    },
    alerts: {
      list: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return get(`/alerts${q ? '?' + q : ''}`);
      },
      unreadCount: () => get('/alerts/unread-count'),
      markRead: (id) => post(`/alerts/${id}/read`),
      markAllRead: () => post('/alerts/mark-all-read'),
    },
    reports: {
      list: () => get('/reports'),
      get: (id) => get(`/reports/${id}`),
      generate: () => post('/reports/generate'),
    },
    search: {
      query: (q, type) => get(`/search?q=${encodeURIComponent(q)}${type ? '&type=' + type : ''}`),
    },
    scraping: {
      triggerAll: (slug) => post(`/scraping/all/${slug}`),
      triggerLinkedInAll: () => post('/scraping/linkedin/all'),
    },
  };
})();
