export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'anthropic',
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.ALERT_FROM_EMAIL,
    to: process.env.ALERT_TO_EMAIL,
  },
  scrapers: {
    brightdataKey: process.env.BRIGHTDATA_API_KEY,
    proxycurlKey: process.env.PROXYCURL_API_KEY,
    apifyKey: process.env.APIFY_API_KEY,
    newsapiKey: process.env.NEWSAPI_KEY,
    serperKey: process.env.SERPER_API_KEY,
    rateLimit: parseInt(process.env.SCRAPER_RATE_LIMIT_DELAY, 10) || 2000,
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  },
  features: {
    emailAlerts: process.env.ENABLE_EMAIL_ALERTS !== 'false',
    linkedinScraping: process.env.ENABLE_LINKEDIN_SCRAPING !== 'false',
    websiteScraping: process.env.ENABLE_WEBSITE_SCRAPING !== 'false',
    newsMonitoring: process.env.ENABLE_NEWS_MONITORING !== 'false',
    socialMonitoring: process.env.ENABLE_SOCIAL_MONITORING !== 'false',
  },
});
