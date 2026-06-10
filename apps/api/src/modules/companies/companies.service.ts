import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@Injectable()
export class CompaniesService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.company.findMany({
      where: { isActive: true },
      orderBy: { threatScore: 'desc' },
      include: {
        _count: {
          select: {
            linkedinPosts: true,
            newsArticles: true,
            customers: true,
            partnerships: true,
            websiteChanges: true,
          },
        },
      },
    });
  }

  async findOne(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        sources: true,
        _count: {
          select: {
            linkedinPosts: true,
            newsArticles: true,
            customers: true,
            partnerships: true,
            websiteChanges: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException(`Company ${slug} not found`);
    return company;
  }

  async getKpis(slug: string) {
    const company = await this.findOne(slug);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      weeklyMentions,
      websiteChanges,
      linkedinPosts,
      partnerships,
      newCustomers,
      productLaunches,
    ] = await Promise.all([
      this.prisma.newsArticle.count({
        where: { companyId: company.id, publishedAt: { gte: weekAgo } },
      }),
      this.prisma.websiteChange.count({
        where: { companyId: company.id, detectedAt: { gte: weekAgo } },
      }),
      this.prisma.linkedInPost.count({
        where: { companyId: company.id, publishedAt: { gte: weekAgo } },
      }),
      this.prisma.partnership.count({
        where: { companyId: company.id, detectedAt: { gte: weekAgo } },
      }),
      this.prisma.customer.count({
        where: { companyId: company.id, detectedAt: { gte: weekAgo } },
      }),
      this.prisma.newsArticle.count({
        where: {
          companyId: company.id,
          category: 'product_launch',
          publishedAt: { gte: weekAgo },
        },
      }),
    ]);

    return {
      weeklyMentions,
      websiteChanges,
      linkedinPosts,
      partnerships,
      newCustomers,
      productLaunches,
      threatScore: company.threatScore,
    };
  }

  async create(data: {
    slug: string;
    name: string;
    website: string;
    description?: string;
    linkedinUrl?: string;
    twitterHandle?: string;
    industry?: string;
    foundedYear?: number;
    headquarters?: string;
  }) {
    return this.prisma.company.create({ data });
  }

  async update(slug: string, data: Partial<{
    name: string;
    description: string;
    website: string;
    linkedinUrl: string;
    twitterHandle: string;
    threatScore: number;
    isActive: boolean;
  }>) {
    const company = await this.findOne(slug);
    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }

  async getWeeklyTimeline(slug: string) {
    const company = await this.findOne(slug);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const weeks: { start: Date; end: Date }[] = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      weeks.push({ start, end });
    }

    const timeline = await Promise.all(
      weeks.map(async ({ start, end }) => {
        const [posts, changes, news] = await Promise.all([
          this.prisma.linkedInPost.aggregate({
            where: {
              companyId: company.id,
              publishedAt: { gte: start, lt: end },
            },
            _count: true,
            _sum: { likes: true, comments: true, shares: true },
          }),
          this.prisma.websiteChange.count({
            where: {
              companyId: company.id,
              detectedAt: { gte: start, lt: end },
            },
          }),
          this.prisma.newsArticle.count({
            where: {
              companyId: company.id,
              publishedAt: { gte: start, lt: end },
            },
          }),
        ]);

        return {
          week: start.toISOString().split('T')[0],
          linkedinPosts: posts._count,
          linkedinEngagement:
            (posts._sum.likes || 0) +
            (posts._sum.comments || 0) * 3 +
            (posts._sum.shares || 0) * 2,
          websiteChanges: changes,
          newsArticles: news,
        };
      }),
    );

    return timeline;
  }
}
