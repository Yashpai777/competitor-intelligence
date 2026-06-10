import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@Injectable()
export class SocialService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async getPosts(slug: string, options: {
    platform?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return { data: [], meta: { total: 0 } };

    const { platform, page = 1, limit = 20 } = options;
    const where: any = { companyId: company.id };
    if (platform) where.platform = platform;

    const [posts, total] = await Promise.all([
      this.prisma.socialPost.findMany({
        where,
        orderBy: [{ engagementScore: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.socialPost.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getPlatformBreakdown(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) return [];

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const platforms = ['twitter', 'reddit', 'youtube', 'product_hunt'];
    return Promise.all(
      platforms.map(async (platform) => {
        const [count, agg] = await Promise.all([
          this.prisma.socialPost.count({
            where: { companyId: company.id, platform, publishedAt: { gte: weekAgo } },
          }),
          this.prisma.socialPost.aggregate({
            where: { companyId: company.id, platform, publishedAt: { gte: weekAgo } },
            _sum: { likes: true, comments: true, shares: true },
          }),
        ]);

        return {
          platform,
          posts: count,
          engagement:
            (agg._sum.likes || 0) +
            (agg._sum.comments || 0) * 3 +
            (agg._sum.shares || 0) * 2,
        };
      }),
    );
  }
}
