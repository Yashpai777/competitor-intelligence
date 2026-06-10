import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScrapingController } from './scraping.controller';
import { SchedulerService } from '../../queues/scheduler.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'scraping' })],
  controllers: [ScrapingController],
  providers: [SchedulerService],
})
export class ScrapingModule {}
