import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BattlecardService } from './battlecard.service';

@ApiTags('Battlecard')
@Controller('battlecard')
export class BattlecardController {
  constructor(private readonly battlecardService: BattlecardService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get battlecard for a competitor' })
  getBattlecard(@Param('slug') slug: string) {
    return this.battlecardService.getBattlecard(slug);
  }

  @Post(':slug/regenerate')
  @ApiOperation({ summary: 'Regenerate battlecard with latest AI analysis' })
  regenerate(@Param('slug') slug: string) {
    return this.battlecardService.regenerateBattlecard(slug);
  }
}
