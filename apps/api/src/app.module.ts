import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { LinkedInModule } from './modules/linkedin/linkedin.module';
import { WebsiteModule } from './modules/website/website.module';
import { NewsModule } from './modules/news/news.module';
import { SocialModule } from './modules/social/social.module';
import { AiModule } from './modules/ai/ai.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchModule } from './modules/search/search.module';
import { BattlecardModule } from './modules/battlecard/battlecard.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),
    DatabaseModule,
    CompaniesModule,
    LinkedInModule,
    WebsiteModule,
    NewsModule,
    SocialModule,
    AiModule,
    AlertsModule,
    ReportsModule,
    SearchModule,
    BattlecardModule,
    CustomersModule,
    ScrapingModule,
    QueuesModule,
  ],
})
export class AppModule {}
