import { Module } from '@nestjs/common';
import { BattlecardController } from './battlecard.controller';
import { BattlecardService } from './battlecard.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [BattlecardController],
  providers: [BattlecardService],
  exports: [BattlecardService],
})
export class BattlecardModule {}
