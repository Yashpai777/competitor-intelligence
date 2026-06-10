import { Module } from '@nestjs/common';
import { LinkedInController } from './linkedin.controller';
import { LinkedInService } from './linkedin.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService],
})
export class LinkedInModule {}
