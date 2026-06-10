import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@ci/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class BattlecardService {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private ai: AiService,
  ) {}

  async getBattlecard(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        battlecards: true,
        newsArticles: { orderBy: { publishedAt: 'desc' }, take: 5 },
        linkedinPosts: { orderBy: { publishedAt: 'desc' }, take: 5 },
        partnerships: { orderBy: { detectedAt: 'desc' }, take: 3 },
        customers: { orderBy: { detectedAt: 'desc' }, take: 5 },
      },
    });

    if (!company) throw new NotFoundException();

    if (company.battlecards) {
      return company.battlecards;
    }

    return this.generateBattlecard(company);
  }

  async regenerateBattlecard(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        newsArticles: { orderBy: { publishedAt: 'desc' }, take: 10 },
        linkedinPosts: { orderBy: { publishedAt: 'desc' }, take: 10 },
        partnerships: { orderBy: { detectedAt: 'desc' }, take: 5 },
        customers: { orderBy: { detectedAt: 'desc' }, take: 10 },
        websiteChanges: { orderBy: { detectedAt: 'desc' }, take: 5 },
      },
    });

    if (!company) throw new NotFoundException();

    return this.generateBattlecard(company);
  }

  private async generateBattlecard(company: any) {
    const recentActivities = [
      ...company.linkedinPosts.map((p: any) => `LinkedIn: ${p.content.substring(0, 100)}`),
      ...company.newsArticles.map((n: any) => `News: ${n.title}`),
      ...company.partnerships.map((p: any) => `Partnership: ${p.partnerName}`),
    ].join('\n');

    const newsItems = company.newsArticles
      .map((n: any) => `[${n.category}] ${n.title}`)
      .join('\n');

    const websiteContent = `Website: ${company.website}\nDescription: ${company.description || ''}`;

    const aiData = await this.ai.generateBattlecard(
      company.name,
      recentActivities || 'No recent activity data available',
      websiteContent,
      newsItems || 'No recent news available',
    );

    const battlecard = await this.prisma.battlecard.upsert({
      where: { companyId: company.id },
      update: {
        ...aiData,
        generatedAt: new Date(),
      },
      create: {
        companyId: company.id,
        ...aiData,
        targetIndustries: ['Healthcare', 'Financial Services', 'Retail'],
        targetCompanySize: '200+ employees',
        pricingModel: 'Per-minute or subscription',
        pricingNotes: 'Enterprise pricing requires negotiation',
      },
    });

    return battlecard;
  }
}
