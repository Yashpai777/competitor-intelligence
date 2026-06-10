import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface LinkedInPostRaw {
  url: string;
  content: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  images: string[];
  authorName?: string;
  authorHandle?: string;
}

// Apify actor IDs for LinkedIn scraping
const APIFY_ACTOR_COMPANY_POSTS = 'curious_coder/linkedin-post-search-scraper';
const APIFY_ACTOR_PROFILE       = 'anchor-scraper/linkedin-company-posts';

@Injectable()
export class LinkedInScraper {
  private readonly logger = new Logger(LinkedInScraper.name);
  private readonly baseUrl = 'https://api.apify.com/v2';

  constructor(private config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('scrapers.apifyKey') || '';
  }

  // ─────────────────────────────────────────────────────────
  // Main entry point — tries company-posts actor first,
  // falls back to keyword search actor
  // ─────────────────────────────────────────────────────────
  async scrapeCompanyPosts(
    companyName: string,
    linkedinUrl: string,
    maxPosts = 20,
  ): Promise<LinkedInPostRaw[]> {
    if (!this.apiKey) {
      this.logger.warn('APIFY_API_KEY not set — skipping LinkedIn scrape');
      return [];
    }

    try {
      // Prefer the company-page actor when we have a LinkedIn URL
      if (linkedinUrl) {
        const posts = await this.runCompanyPostsActor(linkedinUrl, maxPosts);
        if (posts.length > 0) return posts;
      }

      // Fallback: keyword search actor
      return await this.runSearchActor(companyName, maxPosts);
    } catch (e) {
      this.logger.error(`LinkedIn scrape failed for ${companyName}: ${e.message}`);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────
  // Actor: anchor-scraper/linkedin-company-posts
  // Input: company LinkedIn URL → returns posts from that page
  // ─────────────────────────────────────────────────────────
  private async runCompanyPostsActor(
    linkedinUrl: string,
    maxPosts: number,
  ): Promise<LinkedInPostRaw[]> {
    const runId = await this.startRun(APIFY_ACTOR_PROFILE, {
      startUrls: [{ url: linkedinUrl }],
      maxPosts,
      proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
    });

    const items = await this.waitForResults(runId);
    return items.map(this.normalizeCompanyPost);
  }

  // ─────────────────────────────────────────────────────────
  // Actor: curious_coder/linkedin-post-search-scraper
  // Input: search query → returns matching posts
  // ─────────────────────────────────────────────────────────
  private async runSearchActor(
    companyName: string,
    maxPosts: number,
  ): Promise<LinkedInPostRaw[]> {
    const runId = await this.startRun(APIFY_ACTOR_COMPANY_POSTS, {
      searchQueries: [`${companyName} AI voice`],
      maxResults: maxPosts,
      proxy: { useApifyProxy: true },
    });

    const items = await this.waitForResults(runId);
    return items.map(this.normalizeSearchPost);
  }

  // ─────────────────────────────────────────────────────────
  // Apify helpers
  // ─────────────────────────────────────────────────────────
  private async startRun(actorId: string, input: object): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/acts/${encodeURIComponent(actorId)}/runs`,
      input,
      {
        params: { token: this.apiKey },
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      },
    );
    return response.data.data.id;
  }

  private async waitForResults(runId: string, timeoutMs = 120_000): Promise<any[]> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      await this.sleep(5000);

      const status = await this.getRunStatus(runId);

      if (status === 'SUCCEEDED') {
        return this.fetchDataset(runId);
      }

      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
        throw new Error(`Apify run ${runId} ended with status: ${status}`);
      }

      // RUNNING or READY — keep polling
    }

    throw new Error(`Timed out waiting for Apify run ${runId}`);
  }

  private async getRunStatus(runId: string): Promise<string> {
    const res = await axios.get(`${this.baseUrl}/actor-runs/${runId}`, {
      params: { token: this.apiKey },
      timeout: 10000,
    });
    return res.data.data.status;
  }

  private async fetchDataset(runId: string): Promise<any[]> {
    const res = await axios.get(
      `${this.baseUrl}/actor-runs/${runId}/dataset/items`,
      {
        params: { token: this.apiKey, format: 'json', limit: 50 },
        timeout: 15000,
      },
    );
    return res.data || [];
  }

  // ─────────────────────────────────────────────────────────
  // Normalizers — map raw actor output → LinkedInPostRaw
  // These field names match the most common Apify LinkedIn actors.
  // Adjust if your actor returns different keys.
  // ─────────────────────────────────────────────────────────
  private normalizeCompanyPost = (item: any): LinkedInPostRaw => ({
    url: item.postUrl || item.url || '',
    content: item.text || item.content || item.description || '',
    publishedAt: item.postedAt || item.date || item.publishedAt || new Date().toISOString(),
    likes: item.numLikes ?? item.likes ?? 0,
    comments: item.numComments ?? item.comments ?? 0,
    shares: item.numShares ?? item.shares ?? 0,
    views: item.numViews ?? item.views,
    images: item.images || [],
    authorName: item.authorName || item.companyName,
    authorHandle: item.authorSlug,
  });

  private normalizeSearchPost = (item: any): LinkedInPostRaw => ({
    url: item.postUrl || item.link || '',
    content: item.text || item.content || '',
    publishedAt: item.postedAt || item.date || new Date().toISOString(),
    likes: item.likesCount ?? item.likes ?? 0,
    comments: item.commentsCount ?? item.comments ?? 0,
    shares: item.sharesCount ?? item.shares ?? 0,
    views: item.viewsCount,
    images: item.images || [],
    authorName: item.authorName,
    authorHandle: item.authorSlug,
  });

  private sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}
