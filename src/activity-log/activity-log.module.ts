import { Module } from '@nestjs/common';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';

@Module({
  providers: [ActivityLogService],
  controllers: [ActivityLogController],
})
export class ActivityLogModule {} 