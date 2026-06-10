import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@Injectable()
export class SearchService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async globalSearch(query: string, options: {
    companySlug?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}) {
    const { companySlug, category, dateFrom, dateTo, limit = 50 } = options;

    let companyId: string | undefined;
    if (companySlug) {
      const company = await this.prisma.company.findUnique({
        where: { slug: companySlug },
      });
      companyId = company?.id;
    }

    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
    }

    const [posts, news, customers, partnerships, changes] = await Promise.all([
      // LinkedIn posts
      this.prisma.linkedInPost.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          content: { contains: query, mode: 'insensitive' },
          ...(Object.keys(dateFilter).length ? { publishedAt: dateFilter } : {}),
        },
        include: { company: { select: { name: true, slug: true, logo: true } } },
        take: Math.floor(limit / 5),
        orderBy: { engagementScore: 'desc' },
      }),

      // News articles
      this.prisma.newsArticle.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          ...(category ? { category } : {}),
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
          ...(Object.keys(dateFilter).length ? { publishedAt: dateFilter } : {}),
        },
        include: { company: { select: { name: true, slug: true, logo: true } } },
        take: Math.floor(limit / 5),
        orderBy: { importance: 'desc' },
      }),

      // Customers
      this.prisma.customer.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          customerName: { contains: query, mode: 'insensitive' },
        },
        include: { company: { select: { name: true, slug: true, logo: true } } },
        take: Math.floor(limit / 5),
      }),

      // Partnerships
      this.prisma.partnership.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { partnerName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { company: { select: { name: true, slug: true, logo: true } } },
        take: Math.floor(limit / 5),
      }),

      // Website changes
      this.prisma.websiteChange.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { diffSummary: { contains: query, mode: 'insensitive' } },
            { aiSummary: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { company: { select: { name: true, slug: true, logo: true } } },
        take: Math.floor(limit / 5),
        orderBy: { importance: 'desc' },
      }),
    ]);

    const results = [
      ...posts.map((p) => ({
        type: 'linkedin_post',
        id: p.id,
        title: p.content.substring(0, 100) + '...',
        excerpt: p.content.substring(0, 200),
        date: p.publishedAt,
        company: p.company,
        metadata: { likes: p.likes, comments: p.comments, engagementScore: p.engagementScore },
        url: p.postUrl,
      })),
      ...news.map((n) => ({
        type: 'news',
        id: n.id,
        title: n.title,
        excerpt: n.excerpt || '',
        date: n.publishedAt,
        company: n.company,
        metadata: { category: n.category, source: n.source, importance: n.importance },
        url: n.url,
      })),
      ...customers.map((c) => ({
        type: 'customer',
        id: c.id,
        title: c.customerName,
        excerpt: c.description || '',
        date: c.detectedAt,
        company: c.company,
        metadata: { source: c.source },
        url: c.sourceUrl,
      })),
      ...partnerships.map((p) => ({
        type: 'partnership',
        id: p.id,
        title: p.partnerName,
        excerpt: p.description || '',
        date: p.detectedAt,
        company: p.company,
        metadata: { type: p.type, source: p.source },
        url: p.sourceUrl,
      })),
      ...changes.map((c) => ({
        type: 'website_change',
        id: c.id,
        title: `${c.pageType} - ${c.changeType}`,
        excerpt: c.diffSummary || c.aiSummary || '',
        date: c.detectedAt,
        company: c.company,
        metadata: { pageType: c.pageType, importance: c.importance },
        url: c.url,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      query,
      total: results.length,
      results,
    };
  }
}
