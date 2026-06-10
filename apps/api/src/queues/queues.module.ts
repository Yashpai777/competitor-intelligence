import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScrapingProcessor } from './scraping.processor';
import { WebsiteModule } from '../modules/website/website.module';
import { NewsModule } from '../modules/news/news.module';
import { LinkedInModule } from '../modules/linkedin/linkedin.module';
import { AlertsModule } from '../modules/alerts/alerts.module';
import { AiModule } from '../modules/ai/ai.module';
import { WebsiteScraper } from '../scrapers/website.scraper';
import { NewsScraper } from '../scrapers/news.scraper';
import { LinkedInScraper } from '../scrapers/linkedin.scraper';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'scraping' },
      { name: 'reports' },
    ),
    WebsiteModule,
    NewsModule,
    LinkedInModule,
    AlertsModule,
    AiModule,
  ],
  providers: [ScrapingProcessor, WebsiteScraper, NewsScraper, LinkedInScraper, SchedulerService],
  exports: [BullModule],
})
export class QueuesModule {}
