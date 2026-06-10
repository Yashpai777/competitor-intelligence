import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Companies
export const companiesApi = {
  getAll: () => api.get('/companies').then((r) => r.data),
  getOne: (slug: string) => api.get(`/companies/${slug}`).then((r) => r.data),
  getKpis: (slug: string) => api.get(`/companies/${slug}/kpis`).then((r) => r.data),
  getTimeline: (slug: string) => api.get(`/companies/${slug}/timeline`).then((r) => r.data),
  create: (data: any) => api.post('/companies', data).then((r) => r.data),
  update: (slug: string, data: any) => api.put(`/companies/${slug}`, data).then((r) => r.data),
};

// LinkedIn
export const linkedinApi = {
  getPosts: (slug: string, params?: any) =>
    api.get(`/linkedin/${slug}/posts`, { params }).then((r) => r.data),
  getTopPosts: (slug: string, limit = 5) =>
    api.get(`/linkedin/${slug}/posts/top`, { params: { limit } }).then((r) => r.data),
  getWeeklySummary: (slug: string) =>
    api.get(`/linkedin/${slug}/summary`).then((r) => r.data),
  getTrends: (slug: string) =>
    api.get(`/linkedin/${slug}/trends`).then((r) => r.data),
  getEngagementChart: (slug: string) =>
    api.get(`/linkedin/${slug}/engagement-chart`).then((r) => r.data),
};

// Website
export const websiteApi = {
  getChanges: (slug: string, params?: any) =>
    api.get(`/website/${slug}/changes`, { params }).then((r) => r.data),
  getWeeklySummary: (slug: string) =>
    api.get(`/website/${slug}/summary`).then((r) => r.data),
  getSnapshots: (slug: string, pageType?: string) =>
    api.get(`/website/${slug}/snapshots`, { params: { pageType } }).then((r) => r.data),
  getChangeChart: (slug: string) =>
    api.get(`/website/${slug}/change-chart`).then((r) => r.data),
};

// News
export const newsApi = {
  getArticles: (slug: string, params?: any) =>
    api.get(`/news/${slug}/articles`, { params }).then((r) => r.data),
  getWeeklySummary: (slug: string) =>
    api.get(`/news/${slug}/summary`).then((r) => r.data),
  getFundingHistory: (slug: string) =>
    api.get(`/news/${slug}/funding`).then((r) => r.data),
};

// Customers & Partnerships
export const customersApi = {
  getCustomers: (slug: string, params?: any) =>
    api.get(`/customers/${slug}`, { params }).then((r) => r.data),
  getPartnerships: (slug: string, params?: any) =>
    api.get(`/customers/${slug}/partnerships`, { params }).then((r) => r.data),
  getGrowthChart: (slug: string) =>
    api.get(`/customers/${slug}/growth-chart`).then((r) => r.data),
};

// Battlecard
export const battlecardApi = {
  get: (slug: string) => api.get(`/battlecard/${slug}`).then((r) => r.data),
  regenerate: (slug: string) =>
    api.post(`/battlecard/${slug}/regenerate`).then((r) => r.data),
};

// Reports
export const reportsApi = {
  getLatestGlobal: () => api.get('/reports/weekly').then((r) => r.data),
  getHistory: (limit = 10) =>
    api.get('/reports/weekly/history', { params: { limit } }).then((r) => r.data),
  generateReport: () => api.post('/reports/weekly/generate').then((r) => r.data),
};

// Alerts
export const alertsApi = {
  getAlerts: (params?: any) => api.get('/alerts', { params }).then((r) => r.data),
  getUnreadCount: () => api.get('/alerts/unread-count').then((r) => r.data),
  markRead: (id: string) => api.post(`/alerts/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/alerts/read-all').then((r) => r.data),
};

// Search
export const searchApi = {
  search: (q: string, params?: any) =>
    api.get('/search', { params: { q, ...params } }).then((r) => r.data),
};

// Scraping (manual triggers)
export const scrapingApi = {
  triggerLinkedIn: (slug: string) =>
    api.post(`/scraping/linkedin/${slug}`).then((r) => r.data),
  triggerWebsite: (slug: string) =>
    api.post(`/scraping/website/${slug}`).then((r) => r.data),
  triggerNews: (slug: string) =>
    api.post(`/scraping/news/${slug}`).then((r) => r.data),
  triggerAll: (slug: string) =>
    api.post(`/scraping/all/${slug}`).then((r) => r.data),
  triggerLinkedInAll: () =>
    api.post('/scraping/linkedin/all').then((r) => r.data),
};
