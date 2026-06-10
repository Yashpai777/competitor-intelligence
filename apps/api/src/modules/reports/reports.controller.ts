import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get latest global weekly report' })
  getLatestGlobal() {
    return this.reportsService.getLatestGlobalReport();
  }

  @Get('weekly/history')
  @ApiOperation({ summary: 'Get historical weekly reports' })
  getHistory(@Query('limit') limit?: string) {
    return this.reportsService.getAllReports(limit ? parseInt(limit) : 10);
  }

  @Post('weekly/generate')
  @ApiOperation({ summary: 'Manually trigger weekly report generation' })
  generateReport() {
    return this.reportsService.generateGlobalReport();
  }

  @Get('weekly/:slug')
  @ApiOperation({ summary: 'Get latest report for specific competitor' })
  getCompanyReport(@Param('slug') slug: string) {
    return this.reportsService.getCompanyReport(slug);
  }
}
