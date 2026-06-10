import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@ci/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private ai: AiService,
  ) {}

  async getLatestGlobalReport() {
    const report = await this.prisma.weeklyReport.findFirst({
      where: { companyId: null },
      orderBy: { weekStart: 'desc' },
    });

    if (!report) {
      return this.generateGlobalReport();
    }

    // Regenerate if older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (report.generatedAt < oneDayAgo) {
      return this.generateGlobalReport();
    }

    return report;
  }

  async generateGlobalReport() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekAgo);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date();

    const companies = await this.prisma.company.findMany({
      where: { isActive: true },
    });

    const competitorData = await Promise.all(
      companies.map(async (company) => {
        const [posts, changes, news, customers, partnerships] = await Promise.all([
          this.prisma.linkedInPost.count({
            where: { companyId: company.id, publishedAt: { gte: weekAgo } },
          }),
          this.prisma.websiteChange.count({
            where: { companyId: company.id, detectedAt: { gte: weekAgo } },
          }),
          this.prisma.newsArticle.count({
            where: { companyId: company.id, publishedAt: { gte: weekAgo } },
          }),
          this.prisma.customer.count({
            where: { companyId: company.id, detectedAt: { gte: weekAgo } },
          }),
          this.prisma.partnership.count({
            where: { companyId: company.id, detectedAt: { gte: weekAgo } },
          }),
        ]);

        return {
          name: company.name,
          postCount: posts,
          websiteChanges: changes,
          newsArticles: news,
          newCustomers: customers,
          newPartnerships: partnerships,
          threatScore: company.threatScore || 0,
        };
      }),
    );

    const [executiveSummary, strategicInsights] = await Promise.all([
      this.ai.generateWeeklyExecutiveSummary(competitorData),
      this.ai.generateStrategicInsights(
        competitorData.map((c) => ({
          name: c.name,
          recentActivity: `${c.postCount} LinkedIn posts, ${c.websiteChanges} website changes, ${c.newsArticles} news items, ${c.newCustomers} new customers`,
        })),
      ),
    ]);

    const totals = competitorData.reduce(
      (acc, c) => ({
        posts: acc.posts + c.postCount,
        changes: acc.changes + c.websiteChanges,
        news: acc.news + c.newsArticles,
        customers: acc.customers + c.newCustomers,
        partnerships: acc.partnerships + c.newPartnerships,
      }),
      { posts: 0, changes: 0, news: 0, customers: 0, partnerships: 0 },
    );

    return this.prisma.weeklyReport.create({
      data: {
        companyId: null,
        weekStart,
        weekEnd,
        linkedinPostCount: totals.posts,
        websiteChanges: totals.changes,
        newsArticles: totals.news,
        newCustomers: totals.customers,
        newPartnerships: totals.partnerships,
        executiveSummary,
        strategicInsights,
        rawData: { competitorData },
      },
    });
  }

  async getCompanyReport(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return null;

    const report = await this.prisma.weeklyReport.findFirst({
      where: { companyId: company.id },
      orderBy: { weekStart: 'desc' },
    });

    return report;
  }

  async getAllReports(limit = 10) {
    return this.prisma.weeklyReport.findMany({
      where: { companyId: null },
      orderBy: { weekStart: 'desc' },
      take: limit,
    });
  }

  @Cron(process.env.CRON_WEEKLY_REPORT || '0 9 * * 1')
  async scheduledWeeklyReport() {
    this.logger.log('Generating scheduled weekly report...');
    try {
      await this.generateGlobalReport();
      this.logger.log('Weekly report generated successfully');
    } catch (e) {
      this.logger.error('Failed to generate weekly report:', e.message);
    }
  }
}
