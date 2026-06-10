import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WebsiteService } from '../modules/website/website.service';
import { NewsService } from '../modules/news/news.service';
import { LinkedInService } from '../modules/linkedin/linkedin.service';
import { AlertsService } from '../modules/alerts/alerts.service';
import { AiService } from '../modules/ai/ai.service';
import { WebsiteScraper } from '../scrapers/website.scraper';
import { NewsScraper } from '../scrapers/news.scraper';
import { LinkedInScraper } from '../scrapers/linkedin.scraper';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    private websiteService: WebsiteService,
    private newsService: NewsService,
    private linkedinService: LinkedInService,
    private alertsService: AlertsService,
    private aiService: AiService,
    private websiteScraper: WebsiteScraper,
    private newsScraper: NewsScraper,
    private linkedinScraper: LinkedInScraper,
  ) {}

  @Process('scrape-website')
  async handleWebsiteScrape(job: Job<{ companyId: string; companyName: string; website: string; slug: string }>) {
    const { companyId, companyName, website, slug } = job.data;
    this.logger.log(`Scraping website for ${companyName}`);

    const pages = [
      { type: 'homepage', url: website },
      { type: 'pricing', url: `${website}/pricing` },
      { type: 'product', url: `${website}/product` },
      { type: 'integrations', url: `${website}/integrations` },
      { type: 'blog', url: `${website}/blog` },
    ];

    try {
      const scrapedPages = await this.websiteScraper.scrapePages(companyName, website, pages);

      for (const page of scrapedPages) {
        // Get previous snapshot
        const snapshots = await this.websiteService.getSnapshots(slug, page.pageType);
        const previousSnapshot = snapshots[0];

        // Store new snapshot
        await this.websiteService.storeSnapshot(companyId, {
          pageType: page.pageType,
          url: page.url,
          htmlContent: page.html.substring(0, 50000),
          textContent: page.text.substring(0, 20000),
          checksum: page.checksum,
          statusCode: page.statusCode,
        });

        // Detect changes
        if (previousSnapshot && previousSnapshot.checksum !== page.checksum) {
          const diff = this.websiteScraper.computeDiff(
            previousSnapshot['textContent'] || '',
            page.text,
          );

          if (diff.added.length > 0 || diff.removed.length > 0) {
            const importance = this.scoreChangeImportance(page.pageType, diff.summary);

            const change = await this.websiteService.storeChange(companyId, {
              pageType: page.pageType,
              url: page.url,
              changeType: diff.added.length > diff.removed.length ? 'addition' : 'modification',
              importance,
              diffSummary: diff.summary,
              beforeContent: diff.removed.slice(0, 5).join('\n'),
              afterContent: diff.added.slice(0, 5).join('\n'),
            });

            // Create alert for high importance changes
            if (importance >= 70) {
              await this.alertsService.createAlert({
                companyId,
                type: 'website_change',
                severity: importance >= 85 ? 'high' : 'medium',
                title: `${companyName} updated ${page.pageType} page`,
                description: diff.summary,
                sourceUrl: page.url,
                metadata: { changeId: change.id, importance },
              });
            }
          }
        }
      }

      this.logger.log(`Website scrape complete for ${companyName}: ${scrapedPages.length} pages`);
    } catch (e) {
      this.logger.error(`Website scrape failed for ${companyName}:`, e.message);
      throw e;
    }
  }

  @Process('scrape-news')
  async handleNewsScrape(job: Job<{ companyId: string; companyName: string; slug: string }>) {
    const { companyId, companyName } = job.data;
    this.logger.log(`Scraping news for ${companyName}`);

    try {
      const articles = await this.newsScraper.scrapeNews(companyName);

      for (const article of articles) {
        const stored = await this.newsService.storeArticle(companyId, {
          title: article.title,
          url: article.url,
          source: article.source,
          excerpt: article.excerpt,
          imageUrl: article.imageUrl,
          category: article.category,
          importance: article.importance,
          publishedAt: article.publishedAt,
        });

        // Alert on important news
        if (stored && article.importance >= 80) {
          const severityMap: Record<string, any> = {
            funding: 'high',
            acquisition: 'high',
            partnership: 'medium',
            product_launch: 'medium',
            customer: 'low',
          };

          await this.alertsService.createAlert({
            companyId,
            type: article.category,
            severity: severityMap[article.category] || 'low',
            title: article.title,
            description: article.excerpt,
            sourceUrl: article.url,
            metadata: { source: article.source, importance: article.importance },
          });
        }
      }

      this.logger.log(`News scrape complete for ${companyName}: ${articles.length} articles`);
    } catch (e) {
      this.logger.error(`News scrape failed for ${companyName}:`, e.message);
      throw e;
    }
  }

  @Process('scrape-linkedin')
  async handleLinkedInScrape(
    job: Job<{ companyId: string; companyName: string; linkedinUrl: string; slug: string }>,
  ) {
    const { companyId, companyName, linkedinUrl } = job.data;
    this.logger.log(`Scraping LinkedIn for ${companyName}`);

    try {
      const rawPosts = await this.linkedinScraper.scrapeCompanyPosts(
        companyName,
        linkedinUrl,
        25,
      );

      if (rawPosts.length === 0) {
        this.logger.warn(`No LinkedIn posts returned for ${companyName}`);
        return;
      }

      // Classify topic category with AI (batch to save cost)
      const postsWithCategory = await Promise.all(
        rawPosts.map(async (post) => {
          const category = await this.aiService.classifyPost(post.content);
          return { ...post, category };
        }),
      );

      const stored = await this.linkedinService.storePosts(companyId, postsWithCategory);

      // Alert on viral posts (engagement > 1000)
      for (const post of postsWithCategory) {
        const engagement =
          (post.likes || 0) + (post.comments || 0) * 3 + (post.shares || 0) * 2;

        if (engagement >= 1000) {
          await this.alertsService.createAlert({
            companyId,
            type: 'viral_post',
            severity: engagement >= 2000 ? 'high' : 'medium',
            title: `${companyName} viral post (${engagement} engagement)`,
            description: post.content.substring(0, 200),
            sourceUrl: post.url,
            metadata: { engagement, likes: post.likes, category: post.category },
          });
        }
      }

      this.logger.log(`LinkedIn scrape complete for ${companyName}: ${stored.length} posts`);
    } catch (e) {
      this.logger.error(`LinkedIn scrape failed for ${companyName}: ${e.message}`);
      throw e;
    }
  }

  private scoreChangeImportance(pageType: string, summary: string): number {
    let score = 40;
    if (pageType === 'pricing') score += 30;
    if (pageType === 'product') score += 20;
    if (pageType === 'integrations') score += 20;
    if (pageType === 'homepage') score += 15;

    const lower = summary.toLowerCase();
    if (lower.includes('pricing') || lower.includes('price')) score += 20;
    if (lower.includes('enterprise') || lower.includes('feature')) score += 10;

    return Math.min(100, score);
  }
}
