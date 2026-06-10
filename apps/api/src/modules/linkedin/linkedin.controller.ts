import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LinkedInService } from './linkedin.service';

@ApiTags('LinkedIn')
@Controller('linkedin')
export class LinkedInController {
  constructor(private readonly linkedinService: LinkedInService) {}

  @Get(':slug/posts')
  @ApiOperation({ summary: 'Get LinkedIn posts for a competitor' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  getPosts(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.linkedinService.getPostsByCompany(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      category,
      dateFrom,
      dateTo,
    });
  }

  @Get(':slug/posts/top')
  @ApiOperation({ summary: 'Get top performing LinkedIn posts' })
  getTopPosts(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedinService.getTopPosts(slug, limit ? parseInt(limit) : 5);
  }

  @Get(':slug/summary')
  @ApiOperation({ summary: 'Get weekly LinkedIn summary with AI analysis' })
  getWeeklySummary(@Param('slug') slug: string) {
    return this.linkedinService.getWeeklySummary(slug);
  }

  @Get(':slug/trends')
  @ApiOperation({ summary: 'Get topic trends from LinkedIn posts' })
  getTrends(@Param('slug') slug: string) {
    return this.linkedinService.getTrends(slug);
  }

  @Get(':slug/engagement-chart')
  @ApiOperation({ summary: 'Get engagement chart data (8 weeks)' })
  getEngagementChart(@Param('slug') slug: string) {
    return this.linkedinService.getEngagementChart(slug);
  }
}
