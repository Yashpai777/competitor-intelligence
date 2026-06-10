import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const competitors = [
  {
    slug: 'parloa',
    name: 'Parloa',
    description: 'Enterprise AI phone automation platform for contact centers. Parloa builds AI agents that handle customer calls at scale with deep CRM integrations.',
    website: 'https://parloa.com',
    linkedinUrl: 'https://www.linkedin.com/company/parloa',
    twitterHandle: 'parloaAI',
    industry: 'AI Voice Agents',
    foundedYear: 2018,
    headquarters: 'Berlin, Germany',
    employeeCount: '200-500',
    threatScore: 72,
  },
  {
    slug: 'cognigy',
    name: 'Cognigy (NICE)',
    description: 'Conversational AI platform for enterprise contact centers. Acquired by NICE Systems, offering omnichannel AI agents for voice and chat.',
    website: 'https://cognigy.com',
    linkedinUrl: 'https://www.linkedin.com/company/cognigy',
    twitterHandle: 'cognigy',
    industry: 'AI Voice Agents',
    foundedYear: 2016,
    headquarters: 'Düsseldorf, Germany',
    employeeCount: '500-1000',
    threatScore: 85,
  },
  {
    slug: 'bland-ai',
    name: 'Bland AI',
    description: 'Developer-first AI phone call platform. Enables businesses to create, test, and deploy AI phone agents with simple APIs.',
    website: 'https://bland.ai',
    linkedinUrl: 'https://www.linkedin.com/company/bland-ai',
    twitterHandle: 'bland_ai',
    industry: 'AI Voice Agents',
    foundedYear: 2023,
    headquarters: 'San Francisco, CA',
    employeeCount: '1-50',
    threatScore: 68,
  },
  {
    slug: 'vapi',
    name: 'Vapi',
    description: 'Voice AI infrastructure for developers. Build, test, and deploy voice AI applications with sub-500ms latency and enterprise-grade reliability.',
    website: 'https://vapi.ai',
    linkedinUrl: 'https://www.linkedin.com/company/vapi-ai',
    twitterHandle: 'vapi_ai',
    industry: 'AI Voice Agents',
    foundedYear: 2023,
    headquarters: 'San Francisco, CA',
    employeeCount: '1-50',
    threatScore: 75,
  },
  {
    slug: 'retell-ai',
    name: 'Retell AI',
    description: 'Build, test, and deploy AI voice agents at scale. Human-like conversational AI with advanced turn-taking and interruption handling.',
    website: 'https://retellai.com',
    linkedinUrl: 'https://www.linkedin.com/company/retell-ai',
    twitterHandle: 'retell_ai',
    industry: 'AI Voice Agents',
    foundedYear: 2023,
    headquarters: 'San Francisco, CA',
    employeeCount: '1-50',
    threatScore: 70,
  },
  {
    slug: 'air-ai',
    name: 'Air AI',
    description: 'Full-length phone call AI that works round the clock. Autonomous AI that handles complete sales and customer service calls without human intervention.',
    website: 'https://air.ai',
    linkedinUrl: 'https://www.linkedin.com/company/air-ai',
    twitterHandle: 'air_hq',
    industry: 'AI Voice Agents',
    foundedYear: 2022,
    headquarters: 'New York, NY',
    employeeCount: '50-200',
    threatScore: 65,
  },
  {
    slug: 'synthflow',
    name: 'Synthflow',
    description: 'No-code AI voice agent builder. Create AI phone agents without coding — integrates with 200+ tools and supports 20+ languages.',
    website: 'https://synthflow.ai',
    linkedinUrl: 'https://www.linkedin.com/company/synthflow',
    twitterHandle: 'synthflow_ai',
    industry: 'AI Voice Agents',
    foundedYear: 2023,
    headquarters: 'Berlin, Germany',
    employeeCount: '1-50',
    threatScore: 58,
  },
  {
    slug: 'fonio-ai',
    name: 'Fonio.ai',
    description: 'AI voice assistant for restaurants and hospitality. Automated phone answering and reservation management for the food service industry.',
    website: 'https://fonio.ai',
    linkedinUrl: 'https://www.linkedin.com/company/fonio-ai',
    industry: 'AI Voice Agents',
    foundedYear: 2022,
    headquarters: 'Paris, France',
    employeeCount: '1-50',
    threatScore: 42,
  },
  {
    slug: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'AI voice technology company offering ultra-realistic text-to-speech and voice cloning. Expanding into conversational AI agents.',
    website: 'https://elevenlabs.io',
    linkedinUrl: 'https://www.linkedin.com/company/elevenlabsio',
    twitterHandle: 'elevenlabsio',
    industry: 'AI Voice Agents',
    foundedYear: 2022,
    headquarters: 'New York, NY',
    employeeCount: '100-200',
    threatScore: 82,
  },
];

const pageTypes = ['homepage', 'pricing', 'product', 'integrations', 'blog'];

async function main() {
  console.log('🌱 Starting database seed...');

  for (const competitor of competitors) {
    const company = await prisma.company.upsert({
      where: { slug: competitor.slug },
      update: competitor,
      create: competitor,
    });

    console.log(`✅ Created/updated: ${company.name}`);

    // Seed company sources
    for (const pageType of pageTypes) {
      const baseUrl = competitor.website;
      const urlMap: Record<string, string> = {
        homepage: baseUrl,
        pricing: `${baseUrl}/pricing`,
        product: `${baseUrl}/product`,
        integrations: `${baseUrl}/integrations`,
        blog: `${baseUrl}/blog`,
      };

      await prisma.companySource.upsert({
        where: {
          id: `${company.id}-${pageType}`,
        },
        update: { url: urlMap[pageType] },
        create: {
          id: `${company.id}-${pageType}`,
          companyId: company.id,
          type: `website_${pageType}`,
          url: urlMap[pageType],
        },
      });
    }

    // Seed sample LinkedIn posts
    const samplePosts = [
      {
        content: `🚀 Exciting news! We just hit a major milestone — 1,000+ enterprise customers are now using ${competitor.name} to automate their customer calls. The future of voice AI is here. #AIVoice #ContactCenter`,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        topicCategory: 'milestone',
        isViral: true,
      },
      {
        content: `We're thrilled to announce our new integration with Salesforce CRM. Now your AI voice agents can automatically update records, create tasks, and sync call data in real-time. Learn more 👇`,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 300) + 30,
        comments: Math.floor(Math.random() * 60) + 5,
        shares: Math.floor(Math.random() * 30) + 3,
        topicCategory: 'product',
        isViral: false,
      },
      {
        content: `Our latest research shows AI voice agents handle 73% of calls without human escalation. But the real metric? Customer satisfaction is up 28% YoY. Quality over quantity. #CustomerExperience`,
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 400) + 40,
        comments: Math.floor(Math.random() * 80) + 8,
        shares: Math.floor(Math.random() * 40) + 4,
        topicCategory: 'thought_leadership',
        isViral: false,
      },
    ];

    for (const post of samplePosts) {
      const engagement = post.likes + post.comments * 3 + post.shares * 2;
      await prisma.linkedInPost.create({
        data: {
          companyId: company.id,
          content: post.content,
          publishedAt: post.publishedAt,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          engagementScore: engagement,
          topicCategory: post.topicCategory,
          isViral: post.isViral,
          aiSummary: `Post about ${post.topicCategory} that generated strong engagement`,
          aiPerformanceReason: post.isViral
            ? 'Announcement of a significant milestone resonated with the audience, combining social proof with aspirational messaging.'
            : 'Clear value proposition with specific metrics drives credibility.',
        },
      });
    }

    // Seed sample news
    const sampleNews = [
      {
        title: `${competitor.name} Raises $25M Series B to Expand AI Voice Agent Platform`,
        url: `https://techcrunch.com/${competitor.slug}-series-b-${Date.now()}`,
        source: 'TechCrunch',
        category: 'funding',
        importance: 95,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: `${competitor.name} Partners with Leading Telecom Provider to Scale AI Calls`,
        url: `https://businesswire.com/${competitor.slug}-partnership-${Date.now()}`,
        source: 'Business Wire',
        category: 'partnership',
        importance: 75,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const news of sampleNews) {
      try {
        await prisma.newsArticle.create({
          data: {
            companyId: company.id,
            ...news,
            aiSummary: `Key development: ${news.title}`,
          },
        });
      } catch {
        // Skip duplicates
      }
    }

    // Seed battlecard
    await prisma.battlecard.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        strengths: [
          'Strong brand recognition in enterprise market',
          'Robust integration ecosystem',
          'Enterprise-grade security and compliance',
          'Proven scalability with large deployments',
        ],
        weaknesses: [
          'Higher price point than newer competitors',
          'Complex setup for smaller teams',
          'Limited self-service options',
          'Slower innovation cycle vs. startups',
        ],
        recentUpdates: [
          'Launched new multilingual support (20+ languages)',
          'Released Salesforce native integration',
          'Introduced real-time analytics dashboard',
        ],
        howWeCompare: [
          'We offer faster time-to-value with no-code setup',
          'Our pricing is 40% lower for comparable call volumes',
          'Better developer experience with modern APIs',
          'Superior call quality with latest LLM models',
        ],
        objectionHandling: [
          {
            objection: `We're already using ${competitor.name}`,
            response: 'Great starting point! Many of our customers switched after finding our pricing 40% lower with better quality. Would you like to see a side-by-side comparison?',
          },
          {
            objection: `${competitor.name} has more integrations`,
            response: "We have 200+ native integrations and a powerful REST API. What specific integrations matter most to you? We likely support them.",
          },
          {
            objection: `${competitor.name} has better enterprise security`,
            response: 'We\'re SOC 2 Type II certified with HIPAA compliance. Our enterprise tier includes SSO, audit logs, and custom data retention. What are your specific requirements?',
          },
        ],
        positioningRecs: [
          'Lead with speed-to-value: live in hours, not weeks',
          'Emphasize developer-first approach and modern API design',
          'Highlight total cost of ownership advantage',
          'Position as the modern alternative built on latest AI models',
        ],
        targetIndustries: ['Healthcare', 'Financial Services', 'Retail', 'Real Estate'],
        talkingPoints: [
          `Unlike ${competitor.name}, we offer transparent usage-based pricing`,
          'Sub-200ms response latency vs industry average of 600ms+',
          'Native integrations with your existing tech stack',
          'Dedicated success team included in all plans',
        ],
        aiSummary: `${competitor.name} is a ${competitor.threatScore > 70 ? 'high' : 'moderate'}-threat competitor focusing on enterprise deployments. Key differentiator opportunity: our speed-to-value and pricing model.`,
        pricingModel: 'Per-minute or subscription',
        pricingNotes: 'Enterprise pricing requires custom negotiation. SMB plans typically start $500+/mo.',
        targetCompanySize: '500+ employees',
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
