import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@ci/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class LinkedInService {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private config: ConfigService,
    private ai: AiService,
  ) {}

  async getPostsByCompany(
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
    if (!company) throw new NotFoundException(`Company ${slug} not found`);

    const { page = 1, limit = 20, category, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId: company.id };
    if (category) where.topicCategory = category;
    if (dateFrom || dateTo) {
      where.publishedAt = {};
      if (dateFrom) where.publishedAt.gte = new Date(dateFrom);
      if (dateTo) where.publishedAt.lte = new Date(dateTo);
    }

    const [posts, total] = await Promise.all([
      this.prisma.linkedInPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.linkedInPost.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getTopPosts(slug: string, limit = 5) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException(`Company ${slug} not found`);

    return this.prisma.linkedInPost.findMany({
      where: { companyId: company.id },
      orderBy: { engagementScore: 'desc' },
      take: limit,
    });
  }

  async getWeeklySummary(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException(`Company ${slug} not found`);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.linkedInPost.findMany({
      where: { companyId: company.id, publishedAt: { gte: weekAgo } },
      orderBy: { engagementScore: 'desc' },
    });

    if (posts.length === 0) {
      return {
        postCount: 0,
        totalEngagement: 0,
        avgEngagement: 0,
        topicBreakdown: {},
        aiSummary: `${company.name} had no LinkedIn activity this week.`,
        topPost: null,
      };
    }

    const totalEngagement = posts.reduce((sum, p) => sum + p.engagementScore, 0);
    const topicBreakdown = posts.reduce((acc: Record<string, number>, p) => {
      const topic = p.topicCategory || 'general';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    // Check for cached weekly report
    const weekStart = new Date(weekAgo);
    weekStart.setHours(0, 0, 0, 0);

    const existingReport = await this.prisma.weeklyReport.findFirst({
      where: {
        companyId: company.id,
        weekStart: { gte: weekStart },
      },
    });

    let aiSummary = existingReport?.linkedinSummary;
    if (!aiSummary) {
      const postSummaries = posts
        .slice(0, 5)
        .map(
          (p) =>
            `"${p.content.substring(0, 200)}..." - ${p.likes} likes, ${p.comments} comments, ${p.shares} shares`,
        )
        .join('\n');

      aiSummary = await this.ai.generateLinkedInSummary(
        company.name,
        posts.length,
        Math.round(totalEngagement),
        topicBreakdown,
        postSummaries,
      );
    }

    return {
      postCount: posts.length,
      totalEngagement: Math.round(totalEngagement),
      avgEngagement: Math.round(totalEngagement / posts.length),
      topicBreakdown,
      aiSummary,
      topPost: posts[0] || null,
    };
  }

  async getTrends(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.linkedInPost.findMany({
      where: { companyId: company.id, publishedAt: { gte: thirtyDaysAgo } },
    });

    const topicCounts = posts.reduce((acc: Record<string, number>, p) => {
      const topic = p.topicCategory || 'general';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    const trends = Object.entries(topicCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([topic, count]) => ({ topic, count }));

    return trends;
  }

  async getEngagementChart(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      const agg = await this.prisma.linkedInPost.aggregate({
        where: {
          companyId: company.id,
          publishedAt: { gte: start, lt: end },
        },
        _sum: { likes: true, comments: true, shares: true, engagementScore: true },
        _count: true,
      });

      weeks.push({
        week: start.toISOString().split('T')[0],
        posts: agg._count,
        likes: agg._sum.likes || 0,
        comments: agg._sum.comments || 0,
        shares: agg._sum.shares || 0,
        totalEngagement: Math.round(agg._sum.engagementScore || 0),
      });
    }

    return weeks;
  }

  async storePosts(companyId: string, posts: any[]) {
    const results = [];
    for (const post of posts) {
      try {
        const engagement =
          (post.likes || 0) + (post.comments || 0) * 3 + (post.shares || 0) * 2;

        const result = await this.prisma.linkedInPost.upsert({
          where: { postUrl: post.url || `generated-${companyId}-${Date.now()}` },
          update: {
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            engagementScore: engagement,
          },
          create: {
            companyId,
            postUrl: post.url,
            content: post.content,
            publishedAt: new Date(post.publishedAt),
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            views: post.views,
            engagementScore: engagement,
            topicCategory: post.category,
            isViral: engagement > 1000,
            imageUrls: post.images || [],
            rawData: post,
          },
        });
        results.push(result);
      } catch (e) {
        console.error('Error storing LinkedIn post:', e.message);
      }
    }
    return results;
  }
}
