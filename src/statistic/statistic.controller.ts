import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticTransactionFilterDto } from './statistic-transaction-filter.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  /**
   * Lấy danh sách giao dịch theo bộ lọc
   * @param filter (fromDate, toDate, country, operator, status)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async getTransactions(@Body() filter: StatisticTransactionFilterDto) {
    return this.statisticService.getTransactionsByFilter(filter);
  }
}
