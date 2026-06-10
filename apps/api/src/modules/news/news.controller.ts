import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get(':slug/articles')
  getArticles(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.newsService.getArticles(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      category,
      dateFrom,
      dateTo,
    });
  }

  @Get(':slug/summary')
  @ApiOperation({ summary: 'Get weekly news summary with AI analysis' })
  getWeeklySummary(@Param('slug') slug: string) {
    return this.newsService.getWeeklySummary(slug);
  }

  @Get(':slug/funding')
  @ApiOperation({ summary: 'Get funding history' })
  getFundingHistory(@Param('slug') slug: string) {
    return this.newsService.getFundingHistory(slug);
  }
}
