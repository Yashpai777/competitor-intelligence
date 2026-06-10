import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@ApiTags('Scraping')
@Controller('scraping')
export class ScrapingController {
  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    @Inject('PRISMA') private prisma: PrismaClient,
  ) {}

  @Post('linkedin/:slug')
  @ApiOperation({ summary: 'Manually trigger LinkedIn scrape for one competitor' })
  async triggerLinkedIn(@Param('slug') slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return { error: 'Company not found' };

    const job = await this.scrapingQueue.add('scrape-linkedin', {
      companyId: company.id,
      companyName: company.name,
      linkedinUrl: company.linkedinUrl,
      slug: company.slug,
    });

    return { queued: true, jobId: job.id, company: company.name };
  }

  @Post('linkedin/all')
  @ApiOperation({ summary: 'Trigger LinkedIn scrape for all competitors' })
  async triggerLinkedInAll() {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true, linkedinUrl: { not: null } },
    });

    const jobs = await Promise.all(
      companies.map((c, i) =>
        this.scrapingQueue.add(
          'scrape-linkedin',
          { companyId: c.id, companyName: c.name, linkedinUrl: c.linkedinUrl, slug: c.slug },
          { delay: i * 15_000 },
        ),
      ),
    );

    return { queued: jobs.length, companies: companies.map((c) => c.name) };
  }

  @Post('website/:slug')
  @ApiOperation({ summary: 'Manually trigger website scrape for one competitor' })
  async triggerWebsite(@Param('slug') slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return { error: 'Company not found' };

    const job = await this.scrapingQueue.add('scrape-website', {
      companyId: company.id,
      companyName: company.name,
      website: company.website,
      slug: company.slug,
    });

    return { queued: true, jobId: job.id, company: company.name };
  }

  @Post('news/:slug')
  @ApiOperation({ summary: 'Manually trigger news scrape for one competitor' })
  async triggerNews(@Param('slug') slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return { error: 'Company not found' };

    const job = await this.scrapingQueue.add('scrape-news', {
      companyId: company.id,
      companyName: company.name,
      slug: company.slug,
    });

    return { queued: true, jobId: job.id, company: company.name };
  }

  @Post('all/:slug')
  @ApiOperation({ summary: 'Trigger all scrapers for one competitor' })
  async triggerAll(@Param('slug') slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return { error: 'Company not found' };

    const [li, web, news] = await Promise.all([
      this.scrapingQueue.add('scrape-linkedin', {
        companyId: company.id, companyName: company.name,
        linkedinUrl: company.linkedinUrl, slug: company.slug,
      }),
      this.scrapingQueue.add('scrape-website', {
        companyId: company.id, companyName: company.name,
        website: company.website, slug: company.slug,
      }),
      this.scrapingQueue.add('scrape-news', {
        companyId: company.id, companyName: company.name, slug: company.slug,
      }),
    ]);

    return {
      queued: true,
      company: company.name,
      jobs: { linkedin: li.id, website: web.id, news: news.id },
    };
  }
}
