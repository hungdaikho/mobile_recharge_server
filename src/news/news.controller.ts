import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { AuthGuard } from '../auth/auth.guard';

class NewsDto {
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  publishedAt?: Date;
  isPublished?: boolean;
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Public API
  @Get()
  async getAll(@Query('isPublished') isPublished?: string) {
    return this.newsService.getAll({ isPublished: isPublished === 'true' ? true : undefined });
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.newsService.getBySlug(slug);
  }

  // Admin APIs
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() dto: NewsDto & { isPublished: boolean }) {
    return this.newsService.create({
      ...dto,
      publishedAt: dto.isPublished ? new Date() : null
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<NewsDto>) {
    return this.newsService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
} 