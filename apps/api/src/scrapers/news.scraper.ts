import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  excerpt: string;
  publishedAt: Date;
  imageUrl?: string;
  category: string;
  importance: number;
}

const FUNDING_KEYWORDS = ['raises', 'funding', 'series', 'investment', 'backed', 'million', 'valuation'];
const PARTNERSHIP_KEYWORDS = ['partnership', 'partners with', 'integrates', 'collaboration', 'alliance'];
const CUSTOMER_KEYWORDS = ['customer', 'client', 'case study', 'success story', 'deploys', 'uses'];
const PRODUCT_KEYWORDS = ['launches', 'releases', 'announces', 'new feature', 'unveils', 'introduces'];

@Injectable()
export class NewsScraper {
  private readonly logger = new Logger(NewsScraper.name);

  constructor(private config: ConfigService) {}

  async scrapeNews(companyName: string): Promise<NewsItem[]> {
    const items: NewsItem[] = [];

    // Try NewsAPI
    if (this.config.get('scrapers.newsapiKey')) {
      const newsApiItems = await this.fetchFromNewsApi(companyName);
      items.push(...newsApiItems);
    }

    // Try Serper (Google News)
    if (this.config.get('scrapers.serperKey')) {
      const serperItems = await this.fetchFromSerper(companyName);
      items.push(...serperItems);
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }

  private async fetchFromNewsApi(companyName: string): Promise<NewsItem[]> {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `"${companyName}" AI voice`,
          sortBy: 'publishedAt',
          pageSize: 20,
          language: 'en',
          apiKey: this.config.get('scrapers.newsapiKey'),
        },
        timeout: 10000,
      });

      return (response.data.articles || []).map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source?.name || 'NewsAPI',
        excerpt: article.description || '',
        publishedAt: new Date(article.publishedAt),
        imageUrl: article.urlToImage,
        category: this.classifyArticle(article.title + ' ' + (article.description || '')),
        importance: this.scoreImportance(article.title + ' ' + (article.description || '')),
      }));
    } catch (e) {
      this.logger.warn(`NewsAPI fetch failed for ${companyName}:`, e.message);
      return [];
    }
  }

  private async fetchFromSerper(companyName: string): Promise<NewsItem[]> {
    try {
      const response = await axios.post(
        'https://google.serper.dev/news',
        { q: `${companyName} AI voice agent`, num: 20 },
        {
          headers: {
            'X-API-KEY': this.config.get('scrapers.serperKey'),
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      return (response.data.news || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        source: item.source,
        excerpt: item.snippet || '',
        publishedAt: new Date(item.date || Date.now()),
        imageUrl: item.imageUrl,
        category: this.classifyArticle(item.title + ' ' + (item.snippet || '')),
        importance: this.scoreImportance(item.title + ' ' + (item.snippet || '')),
      }));
    } catch (e) {
      this.logger.warn(`Serper fetch failed for ${companyName}:`, e.message);
      return [];
    }
  }

  classifyArticle(text: string): string {
    const lower = text.toLowerCase();
    if (FUNDING_KEYWORDS.some((k) => lower.includes(k))) return 'funding';
    if (PARTNERSHIP_KEYWORDS.some((k) => lower.includes(k))) return 'partnership';
    if (CUSTOMER_KEYWORDS.some((k) => lower.includes(k))) return 'customer';
    if (PRODUCT_KEYWORDS.some((k) => lower.includes(k))) return 'product_launch';
    if (lower.includes('acqui') || lower.includes('merger')) return 'acquisition';
    if (lower.includes('award') || lower.includes('recogni')) return 'award';
    if (lower.includes('hiring') || lower.includes('join') || lower.includes('appoints')) return 'hiring';
    return 'mention';
  }

  scoreImportance(text: string): number {
    const lower = text.toLowerCase();
    let score = 50;

    if (FUNDING_KEYWORDS.some((k) => lower.includes(k))) score += 30;
    if (lower.includes('series b') || lower.includes('series c')) score += 15;
    if (lower.includes('million') || lower.includes('billion')) score += 10;
    if (PARTNERSHIP_KEYWORDS.some((k) => lower.includes(k))) score += 20;
    if (lower.includes('enterprise') || lower.includes('fortune')) score += 10;
    if (lower.includes('acquisition') || lower.includes('acquired')) score += 25;

    return Math.min(100, score);
  }
}
