import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaClient } from '@ci/database';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    @Inject('PRISMA') private prisma: PrismaClient,
  ) {}

  @Cron(process.env.CRON_WEBSITE_SCRAPE || '0 2 * * *')
  async scheduleWebsiteScraping() {
    this.logger.log('Scheduling website scraping for all active companies...');
    await this.queueWebsiteScraping();
  }

  @Cron(process.env.CRON_NEWS_SCRAPE || '0 */4 * * *')
  async scheduleNewsScraping() {
    this.logger.log('Scheduling news scraping for all active companies...');
    await this.queueNewsScraping();
  }

  // LinkedIn via Apify — daily at 6am (Apify actor takes a few minutes to run)
  @Cron(process.env.CRON_LINKEDIN_SCRAPE || '0 6 * * *')
  async scheduleLinkedInScraping() {
    this.logger.log('Scheduling LinkedIn scraping via Apify...');
    await this.queueLinkedInScraping();
  }

  async queueWebsiteScraping() {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true },
    });

    for (const company of companies) {
      await this.scrapingQueue.add(
        'scrape-website',
        {
          companyId: company.id,
          companyName: company.name,
          website: company.website,
          slug: company.slug,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 50,
          removeOnFail: 20,
        },
      );
    }

    this.logger.log(`Queued website scraping for ${companies.length} companies`);
    return companies.length;
  }

  async queueNewsScraping() {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true },
    });

    for (const company of companies) {
      await this.scrapingQueue.add(
        'scrape-news',
        {
          companyId: company.id,
          companyName: company.name,
          slug: company.slug,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 50,
        },
      );
    }

    return companies.length;
  }

  async queueLinkedInScraping() {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true, linkedinUrl: { not: null } },
    });

    for (const company of companies) {
      await this.scrapingQueue.add(
        'scrape-linkedin',
        {
          companyId: company.id,
          companyName: company.name,
          linkedinUrl: company.linkedinUrl,
          slug: company.slug,
        },
        {
          // Apify runs take 1-3 minutes — allow more time, fewer retries
          attempts: 2,
          backoff: { type: 'fixed', delay: 30_000 },
          removeOnComplete: 50,
          // Stagger jobs so Apify isn't hammered simultaneously
          delay: companies.indexOf(company) * 15_000,
        },
      );
    }

    this.logger.log(`Queued LinkedIn scraping for ${companies.length} companies`);
    return companies.length;
  }
}
