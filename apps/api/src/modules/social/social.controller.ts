import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get(':slug/posts')
  getPosts(
    @Param('slug') slug: string,
    @Query('platform') platform?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.socialService.getPosts(slug, {
      platform,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':slug/platform-breakdown')
  getPlatformBreakdown(@Param('slug') slug: string) {
    return this.socialService.getPlatformBreakdown(slug);
  }
}
