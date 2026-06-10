import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all competitors' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get competitor by slug' })
  findOne(@Param('slug') slug: string) {
    return this.companiesService.findOne(slug);
  }

  @Get(':slug/kpis')
  @ApiOperation({ summary: 'Get competitor KPIs for this week' })
  getKpis(@Param('slug') slug: string) {
    return this.companiesService.getKpis(slug);
  }

  @Get(':slug/timeline')
  @ApiOperation({ summary: 'Get weekly timeline data for charts' })
  getTimeline(@Param('slug') slug: string) {
    return this.companiesService.getWeeklyTimeline(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new competitor' })
  create(
    @Body()
    body: {
      slug: string;
      name: string;
      website: string;
      description?: string;
      linkedinUrl?: string;
    },
  ) {
    return this.companiesService.create(body);
  }

  @Put(':slug')
  @ApiOperation({ summary: 'Update competitor details' })
  update(@Param('slug') slug: string, @Body() body: any) {
    return this.companiesService.update(slug, body);
  }
}
