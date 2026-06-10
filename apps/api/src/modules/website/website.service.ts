import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@ci/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class WebsiteService {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private ai: AiService,
  ) {}

  async getChanges(
    slug: string,
    options: {
      page?: number;
      limit?: number;
      pageType?: string;
      minImportance?: number;
    } = {},
  ) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const { page = 1, limit = 20, pageType, minImportance } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId: company.id };
    if (pageType) where.pageType = pageType;
    if (minImportance) where.importance = { gte: minImportance };

    const [changes, total] = await Promise.all([
      this.prisma.websiteChange.findMany({
        where,
        orderBy: [{ importance: 'desc' }, { detectedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.websiteChange.count({ where }),
    ]);

    return {
      data: changes,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getWeeklySummary(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const changes = await this.prisma.websiteChange.findMany({
      where: { companyId: company.id, detectedAt: { gte: weekAgo } },
      orderBy: { importance: 'desc' },
    });

    if (changes.length === 0) {
      return {
        changeCount: 0,
        highImportanceCount: 0,
        changesByPage: {},
        aiSummary: `No website changes detected for ${company.name} this week.`,
        topChange: null,
      };
    }

    const changesByPage = changes.reduce((acc: Record<string, number>, c) => {
      acc[c.pageType] = (acc[c.pageType] || 0) + 1;
      return acc;
    }, {});

    const highImportance = changes.filter((c) => c.importance >= 70);

    const aiSummary = await this.ai.generateWebsiteChangeSummary(
      company.name,
      changes.slice(0, 10).map((c) => ({
        page: c.pageType,
        type: c.changeType,
        description: c.diffSummary || c.changeType,
      })),
    );

    return {
      changeCount: changes.length,
      highImportanceCount: highImportance.length,
      changesByPage,
      aiSummary,
      topChange: changes[0] || null,
    };
  }

  async getSnapshots(slug: string, pageType?: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const where: any = { companyId: company.id };
    if (pageType) where.pageType = pageType;

    return this.prisma.websiteSnapshot.findMany({
      where,
      orderBy: { capturedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        pageType: true,
        url: true,
        screenshotUrl: true,
        capturedAt: true,
        checksum: true,
      },
    });
  }

  async getChangeVolumeChart(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      const count = await this.prisma.websiteChange.count({
        where: {
          companyId: company.id,
          detectedAt: { gte: start, lt: end },
        },
      });

      weeks.push({
        week: start.toISOString().split('T')[0],
        changes: count,
      });
    }

    return weeks;
  }

  async storeChange(
    companyId: string,
    data: {
      pageType: string;
      url: string;
      changeType: string;
      importance: number;
      diffSummary: string;
      beforeContent?: string;
      afterContent?: string;
      beforeScreenshot?: string;
      afterScreenshot?: string;
      aiSummary?: string;
    },
  ) {
    return this.prisma.websiteChange.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  async storeSnapshot(
    companyId: string,
    data: {
      pageType: string;
      url: string;
      htmlContent: string;
      textContent: string;
      screenshotUrl?: string;
      checksum: string;
      statusCode: number;
    },
  ) {
    return this.prisma.websiteSnapshot.create({
      data: {
        companyId,
        ...data,
      },
    });
  }
}
