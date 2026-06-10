import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers & Partnerships')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get customers for a competitor' })
  getCustomers(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.getCustomers(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':slug/partnerships')
  @ApiOperation({ summary: 'Get partnerships for a competitor' })
  getPartnerships(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.getPartnerships(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':slug/growth-chart')
  @ApiOperation({ summary: 'Get customer and partnership growth chart' })
  getGrowthChart(@Param('slug') slug: string) {
    return this.customersService.getGrowthChart(slug);
  }
}
