export interface Company {
  id: string;
  slug: string;
  name: string;
  description?: string;
  website: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  industry?: string;
  foundedYear?: number;
  headquarters?: string;
  employeeCount?: string;
  logo?: string;
  isActive: boolean;
  threatScore?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    linkedinPosts: number;
    newsArticles: number;
    customers: number;
    partnerships: number;
    websiteChanges: number;
  };
}

export interface CompanyKpis {
  weeklyMentions: number;
  websiteChanges: number;
  linkedinPosts: number;
  partnerships: number;
  newCustomers: number;
  productLaunches: number;
  threatScore: number;
}

export interface LinkedInPost {
  id: string;
  companyId: string;
  postUrl?: string;
  content: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  engagementScore: number;
  topicCategory?: string;
  isViral: boolean;
  imageUrls: string[];
  aiSummary?: string;
  aiPerformanceReason?: string;
}

export interface WebsiteChange {
  id: string;
  companyId: string;
  pageType: string;
  url: string;
  changeType: string;
  importance: number;
  diffSummary?: string;
  beforeContent?: string;
  afterContent?: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  aiSummary?: string;
  detectedAt: string;
}

export interface NewsArticle {
  id: string;
  companyId: string;
  title: string;
  url: string;
  source: string;
  excerpt?: string;
  imageUrl?: string;
  category: string;
  sentiment?: string;
  importance: number;
  publishedAt: string;
  aiSummary?: string;
}

export interface Customer {
  id: string;
  companyId: string;
  customerName: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  source: string;
  sourceUrl?: string;
  detectedAt: string;
  description?: string;
}

export interface Partnership {
  id: string;
  companyId: string;
  partnerName: string;
  partnerLogo?: string;
  type?: string;
  source: string;
  sourceUrl?: string;
  description?: string;
  announcedAt?: string;
  detectedAt: string;
}

export interface Battlecard {
  id: string;
  companyId: string;
  strengths: string[];
  weaknesses: string[];
  recentUpdates: string[];
  howWeCompare: string[];
  objectionHandling: { objection: string; response: string }[];
  positioningRecs: string[];
  targetIndustries: string[];
  targetCompanySize?: string;
  talkingPoints: string[];
  aiSummary?: string;
  pricingModel?: string;
  pricingNotes?: string;
  generatedAt: string;
}

export interface Alert {
  id: string;
  companyId?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sourceUrl?: string;
  isRead: boolean;
  createdAt: string;
  company?: { name: string; slug: string; logo?: string };
}

export interface WeeklyReport {
  id: string;
  companyId?: string;
  weekStart: string;
  weekEnd: string;
  linkedinPostCount: number;
  websiteChanges: number;
  newsArticles: number;
  newCustomers: number;
  newPartnerships: number;
  threatScore: number;
  executiveSummary?: string;
  linkedinSummary?: string;
  websiteSummary?: string;
  newsSummary?: string;
  strategicInsights?: string;
  generatedAt: string;
  rawData?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SearchResult {
  type: 'linkedin_post' | 'news' | 'customer' | 'partnership' | 'website_change';
  id: string;
  title: string;
  excerpt: string;
  date: string;
  company: { name: string; slug: string; logo?: string };
  metadata: Record<string, any>;
  url?: string;
}
