import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebsiteService } from './website.service';

@ApiTags('Website')
@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get(':slug/changes')
  @ApiOperation({ summary: 'Get website changes for a competitor' })
  getChanges(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('pageType') pageType?: string,
    @Query('minImportance') minImportance?: string,
  ) {
    return this.websiteService.getChanges(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      pageType,
      minImportance: minImportance ? parseInt(minImportance) : undefined,
    });
  }

  @Get(':slug/summary')
  @ApiOperation({ summary: 'Get weekly website change summary with AI analysis' })
  getWeeklySummary(@Param('slug') slug: string) {
    return this.websiteService.getWeeklySummary(slug);
  }

  @Get(':slug/snapshots')
  @ApiOperation({ summary: 'Get website snapshots' })
  getSnapshots(
    @Param('slug') slug: string,
    @Query('pageType') pageType?: string,
  ) {
    return this.websiteService.getSnapshots(slug, pageType);
  }

  @Get(':slug/change-chart')
  @ApiOperation({ summary: 'Get change volume chart data' })
  getChangeChart(@Param('slug') slug: string) {
    return this.websiteService.getChangeVolumeChart(slug);
  }
}
