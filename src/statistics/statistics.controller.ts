import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getStats(
    @Query('date') date?: string,
    @Query('country') country?: string,
  ) {
    return this.statisticsService.getStats({ date, country });
  }

  @UseGuards(AuthGuard)
  @Post('generate')
  async generate() {
    return this.statisticsService.generateDailyStats();
  }
} 