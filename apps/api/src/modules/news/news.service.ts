import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@ci/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class NewsService {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private ai: AiService,
  ) {}

  async getArticles(
    slug: string,
    options: {
      page?: number;
      limit?: number;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const { page = 1, limit = 20, category, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId: company.id };
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.publishedAt = {};
      if (dateFrom) where.publishedAt.gte = new Date(dateFrom);
      if (dateTo) where.publishedAt.lte = new Date(dateTo);
    }

    const [articles, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        orderBy: [{ importance: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.newsArticle.count({ where }),
    ]);

    return {
      data: articles,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getWeeklySummary(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const articles = await this.prisma.newsArticle.findMany({
      where: { companyId: company.id, publishedAt: { gte: weekAgo } },
      orderBy: { importance: 'desc' },
    });

    if (articles.length === 0) {
      return {
        articleCount: 0,
        categoryBreakdown: {},
        aiSummary: `No significant news coverage for ${company.name} this week.`,
        topArticle: null,
      };
    }

    const categoryBreakdown = articles.reduce((acc: Record<string, number>, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});

    const aiSummary = await this.ai.generateNewsSummary(
      company.name,
      articles.slice(0, 8).map((a) => ({
        title: a.title,
        category: a.category,
        source: a.source,
      })),
    );

    return {
      articleCount: articles.length,
      categoryBreakdown,
      aiSummary,
      topArticle: articles[0] || null,
    };
  }

  async getFundingHistory(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    return this.prisma.newsArticle.findMany({
      where: { companyId: company.id, category: 'funding' },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async storeArticle(companyId: string, data: {
    title: string;
    url: string;
    source: string;
    excerpt?: string;
    content?: string;
    imageUrl?: string;
    category: string;
    sentiment?: string;
    importance: number;
    publishedAt: Date;
  }) {
    try {
      return await this.prisma.newsArticle.upsert({
        where: { url: data.url },
        update: { importance: data.importance },
        create: { companyId, ...data },
      });
    } catch (e) {
      return null;
    }
  }
}
