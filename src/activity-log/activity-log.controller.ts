import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getLogs(
    @Query('phoneNumber') phoneNumber?: string,
    @Query('date') date?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.activityLogService.getLogs({ phoneNumber, date, page, limit });
  }
} 