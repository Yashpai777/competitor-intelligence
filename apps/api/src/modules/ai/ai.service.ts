import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private anthropic: Anthropic;

  constructor(private config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get('ai.anthropicKey'),
    });
  }

  private async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      this.logger.error('AI completion failed:', error.message);
      return 'AI analysis unavailable at this time.';
    }
  }

  async generateLinkedInSummary(
    companyName: string,
    postCount: number,
    totalEngagement: number,
    topicBreakdown: Record<string, number>,
    recentPostSamples: string,
  ): Promise<string> {
    const topics = Object.entries(topicBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, count]) => `${topic} (${count})`)
      .join(', ');

    return this.complete(
      'You are a competitive intelligence analyst specializing in AI voice agent companies. Write concise, insightful summaries for sales and executive teams.',
      `Summarize ${companyName}'s LinkedIn activity this week:
- Posts published: ${postCount}
- Total engagement: ${totalEngagement}
- Topic breakdown: ${topics}
- Recent post samples:
${recentPostSamples}

Write a 2-3 sentence executive summary. Highlight key themes, notable announcements, and what this tells us about their strategy. Be specific and actionable.`,
    );
  }

  async generateWebsiteChangeSummary(
    companyName: string,
    changes: { page: string; type: string; description: string }[],
  ): Promise<string> {
    const changesList = changes
      .map((c) => `- ${c.page} (${c.type}): ${c.description}`)
      .join('\n');

    return this.complete(
      'You are a competitive intelligence analyst. Summarize website changes concisely for executive briefings.',
      `${companyName} made the following website changes this week:
${changesList}

Write a 2-3 sentence summary. Focus on strategic implications — pricing changes, new features, new integrations, messaging shifts. What does this tell us about their direction?`,
    );
  }

  async generateNewsSummary(
    companyName: string,
    articles: { title: string; category: string; source: string }[],
  ): Promise<string> {
    const newsList = articles
      .map((a) => `- [${a.category.toUpperCase()}] ${a.title} (${a.source})`)
      .join('\n');

    return this.complete(
      'You are a competitive intelligence analyst. Summarize news concisely for executive briefings.',
      `Recent news about ${companyName}:
${newsList}

Write a 2-3 sentence summary of the most significant developments. Focus on business impact, competitive threat level, and what our team should know.`,
    );
  }

  async generateWeeklyExecutiveSummary(
    competitorData: {
      name: string;
      postCount: number;
      websiteChanges: number;
      newsArticles: number;
      newCustomers: number;
      newPartnerships: number;
      threatScore: number;
    }[],
  ): Promise<string> {
    const summary = competitorData
      .map(
        (c) =>
          `${c.name}: ${c.postCount} posts, ${c.websiteChanges} site changes, ${c.newsArticles} news items, ${c.newCustomers} new customers, ${c.newPartnerships} partnerships, threat score: ${c.threatScore}/100`,
      )
      .join('\n');

    return this.complete(
      'You are a senior competitive intelligence analyst for an AI voice agent company. Write strategic executive briefings.',
      `Weekly competitor activity summary:
${summary}

Write a 3-4 paragraph executive briefing covering:
1. The most significant competitive developments this week
2. Which competitors are most actively growing/expanding
3. Strategic patterns or market trends you observe
4. Recommended actions for our team

Be specific, strategic, and actionable. Write for a VP/C-suite audience.`,
    );
  }

  async generateStrategicInsights(
    competitorData: { name: string; recentActivity: string }[],
  ): Promise<string> {
    const data = competitorData
      .map((c) => `${c.name}: ${c.recentActivity}`)
      .join('\n\n');

    return this.complete(
      'You are a senior competitive strategy analyst for an AI voice agent company. Provide deep strategic insights.',
      `Based on recent competitor activities:
${data}

Provide 3-4 strategic insights about the competitive landscape. Focus on:
- Market positioning shifts
- Technology bets being made
- Target customer segment focus
- Partnership and ecosystem strategies

Write 2-3 sentences per insight. Be bold and specific.`,
    );
  }

  async generateBattlecard(
    companyName: string,
    recentActivities: string,
    websiteContent: string,
    newsItems: string,
  ): Promise<{
    strengths: string[];
    weaknesses: string[];
    recentUpdates: string[];
    howWeCompare: string[];
    talkingPoints: string[];
    objectionHandling: { objection: string; response: string }[];
    positioningRecs: string[];
    aiSummary: string;
  }> {
    const prompt = `Analyze ${companyName} as a competitor in the AI voice agent space.

Recent activities:
${recentActivities}

Website content highlights:
${websiteContent}

Recent news:
${newsItems}

Generate a comprehensive battlecard in JSON format with these exact fields:
{
  "strengths": ["5-6 specific strengths"],
  "weaknesses": ["5-6 specific weaknesses or vulnerabilities"],
  "recentUpdates": ["3-4 recent notable updates"],
  "howWeCompare": ["4-5 ways we can differentiate"],
  "talkingPoints": ["4-5 key sales talking points against this competitor"],
  "objectionHandling": [
    {"objection": "They say...", "response": "We respond..."},
    {"objection": "...", "response": "..."}
  ],
  "positioningRecs": ["3-4 positioning recommendations"],
  "aiSummary": "2-3 sentence competitive summary"
}

Return ONLY valid JSON, no other text.`;

    try {
      const response = await this.complete(
        'You are a sales strategist and competitive intelligence expert for an AI voice agent company. Return valid JSON only.',
        prompt,
      );

      const parsed = JSON.parse(response.trim());
      return parsed;
    } catch (e) {
      this.logger.error('Failed to parse battlecard JSON:', e.message);
      return {
        strengths: ['Strong market presence', 'Enterprise customer base'],
        weaknesses: ['Complex onboarding', 'Higher price point'],
        recentUpdates: ['New integration announced'],
        howWeCompare: ['Better pricing', 'Faster time to value'],
        talkingPoints: ['We offer 40% lower TCO'],
        objectionHandling: [
          {
            objection: `We already use ${companyName}`,
            response: 'Many customers switch after seeing our pricing and quality comparison.',
          },
        ],
        positioningRecs: ['Focus on speed-to-value', 'Emphasize pricing advantage'],
        aiSummary: `${companyName} is an established competitor in the AI voice agent space.`,
      };
    }
  }

  async classifyPost(content: string): Promise<string> {
    const categories = [
      'product',
      'hiring',
      'partnership',
      'customer',
      'funding',
      'culture',
      'thought_leadership',
      'event',
      'general',
    ];

    const result = await this.complete(
      'Classify LinkedIn posts into categories. Return only the category name, nothing else.',
      `Classify this LinkedIn post into one of these categories: ${categories.join(', ')}\n\nPost: "${content.substring(0, 500)}"\n\nCategory:`,
    );

    const category = result.toLowerCase().trim();
    return categories.includes(category) ? category : 'general';
  }

  async scoreWebsiteChange(
    pageType: string,
    changeDescription: string,
  ): Promise<number> {
    const result = await this.complete(
      'Score website changes by strategic importance 0-100. Return only a number.',
      `Score this website change (0-100, where 100 = extremely important strategic change):
Page: ${pageType}
Change: ${changeDescription}

Consider: pricing changes (high), new features (high), messaging shifts (medium), minor copy edits (low).
Return only the number:`,
    );

    const score = parseInt(result.trim());
    return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
  }
}
