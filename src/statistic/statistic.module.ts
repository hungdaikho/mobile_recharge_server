import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService],
  imports: [PrismaModule]
})
export class StatisticModule {}
