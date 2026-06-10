import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all data' })
  search(
    @Query('q') query: string,
    @Query('company') company?: string,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.globalSearch(query || '', {
      companySlug: company,
      category,
      dateFrom,
      dateTo,
      limit: limit ? parseInt(limit) : 50,
    });
  }
}
