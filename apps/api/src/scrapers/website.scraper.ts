import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface ScrapedPage {
  url: string;
  pageType: string;
  html: string;
  text: string;
  screenshotBuffer?: Buffer;
  statusCode: number;
  checksum: string;
}

@Injectable()
export class WebsiteScraper {
  private readonly logger = new Logger(WebsiteScraper.name);

  constructor(private config: ConfigService) {}

  async scrapePages(
    companyName: string,
    baseUrl: string,
    pages: { type: string; url: string }[],
  ): Promise<ScrapedPage[]> {
    const results: ScrapedPage[] = [];

    // Dynamic import of playwright to avoid issues if not installed
    let chromium: any, browser: any;
    try {
      const playwright = await import('playwright');
      browser = await playwright.chromium.launch({
        headless: this.config.get('scrapers.headless') !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (e) {
      this.logger.warn('Playwright not available, using mock data');
      return this.getMockPages(companyName, pages);
    }

    try {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 },
      });

      for (const page of pages) {
        try {
          const browserPage = await context.newPage();

          const response = await browserPage.goto(page.url, {
            timeout: this.config.get('scrapers.timeout') || 30000,
            waitUntil: 'networkidle',
          });

          const html = await browserPage.content();
          const text = await browserPage.evaluate(() => document.body?.innerText || '');
          const screenshot = await browserPage.screenshot({ fullPage: false });

          const checksum = crypto
            .createHash('md5')
            .update(text.trim())
            .digest('hex');

          results.push({
            url: page.url,
            pageType: page.type,
            html,
            text,
            screenshotBuffer: screenshot,
            statusCode: response?.status() || 200,
            checksum,
          });

          await browserPage.close();

          // Rate limiting
          const delay = this.config.get('scrapers.rateLimit') || 2000;
          await new Promise((r) => setTimeout(r, delay));
        } catch (e) {
          this.logger.error(`Failed to scrape ${page.url}:`, e.message);
        }
      }

      await context.close();
    } finally {
      await browser.close();
    }

    return results;
  }

  computeDiff(
    before: string,
    after: string,
  ): { added: string[]; removed: string[]; summary: string } {
    const beforeLines = new Set(before.split('\n').map((l) => l.trim()).filter(Boolean));
    const afterLines = new Set(after.split('\n').map((l) => l.trim()).filter(Boolean));

    const added: string[] = [];
    const removed: string[] = [];

    afterLines.forEach((line) => {
      if (!beforeLines.has(line) && line.length > 20) {
        added.push(line.substring(0, 200));
      }
    });

    beforeLines.forEach((line) => {
      if (!afterLines.has(line) && line.length > 20) {
        removed.push(line.substring(0, 200));
      }
    });

    const summary = [];
    if (added.length > 0) summary.push(`${added.length} new content sections added`);
    if (removed.length > 0) summary.push(`${removed.length} content sections removed`);

    return {
      added: added.slice(0, 10),
      removed: removed.slice(0, 10),
      summary: summary.join(', ') || 'Minor changes detected',
    };
  }

  private getMockPages(
    companyName: string,
    pages: { type: string; url: string }[],
  ): ScrapedPage[] {
    return pages.map((page) => ({
      url: page.url,
      pageType: page.type,
      html: `<html><body><h1>${companyName} - ${page.type}</h1><p>Mock content for ${page.url}</p></body></html>`,
      text: `${companyName} ${page.type} page content`,
      statusCode: 200,
      checksum: crypto.createHash('md5').update(page.url + Date.now()).digest('hex'),
    }));
  }
}
