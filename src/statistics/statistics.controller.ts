import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/auth.guard';
import { StatisticsQueryDto } from './dto/statistics-query.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(AuthGuard)
  @Get('summary')
  async getSummary(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getSummary(query);
  }

  @UseGuards(AuthGuard)
  @Get('operators')
  async getOperators(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getOperators(query);
  }
} 