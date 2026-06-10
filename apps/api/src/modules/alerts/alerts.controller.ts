import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts with filters' })
  getAlerts(
    @Query('company') company?: string,
    @Query('severity') severity?: string,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.alertsService.getAlerts({
      companySlug: company,
      severity,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('unread-count')
  getUnreadCount() {
    return this.alertsService.getUnreadCount();
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.alertsService.markRead(id);
  }

  @Post('read-all')
  markAllRead() {
    return this.alertsService.markAllRead();
  }
}
