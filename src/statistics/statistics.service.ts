import { Injectable } from '@nestjs/common';
import { PrismaClient, DailyStatistic, Transaction, Prisma } from '@prisma/client';
import { StatisticsQueryDto, GroupBy } from './dto/statistics-query.dto';

@Injectable()
export class StatisticsService {
  private prisma = new PrismaClient();

  async generateDailyStats(date: Date = new Date()): Promise<DailyStatistic[]> {
    // Lấy danh sách country
    const countries = await this.prisma.transaction.findMany({
      distinct: ['country'],
      select: { country: true },
    });
    const stats: DailyStatistic[] = [];
    for (const { country } of countries) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(24, 0, 0, 0);
      const totalTopups = await this.prisma.transaction.count({
        where: { country, createdAt: { gte: start, lt: end }, type: 'topup' },
      });
      const totalAmount = await this.prisma.transaction.aggregate({
        where: { country, createdAt: { gte: start, lt: end }, type: 'topup' },
        _sum: { amount: true },
      });
      const totalRefunded = await this.prisma.transaction.aggregate({
        where: { country, createdAt: { gte: start, lt: end }, type: 'refund' },
        _sum: { amount: true },
      });
      const existing = await this.prisma.dailyStatistic.findFirst({
        where: { date: start, country }
      });
      let stat;
      if (existing) {
        stat = await this.prisma.dailyStatistic.update({
          where: { id: existing.id },
          data: {
            totalTopups,
            totalAmount: totalAmount._sum.amount || 0,
            totalRefunded: totalRefunded._sum.amount || 0,
          }
        });
      } else {
        stat = await this.prisma.dailyStatistic.create({
          data: {
            date: start,
            country,
            totalTopups,
            totalAmount: totalAmount._sum.amount || 0,
            totalRefunded: totalRefunded._sum.amount || 0,
          }
        });
      }
      stats.push(stat);
    }
    return stats;
  }

  async getStats({ date, country }: { date?: string; country?: string }) {
    const where: any = {};
    if (date) where.date = new Date(date);
    if (country) where.country = country;
    return this.prisma.dailyStatistic.findMany({ where, orderBy: { date: 'desc' } });
  }

  async getSummary(query: StatisticsQueryDto) {
    const { startDate, endDate, country, operator } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      type: 'topup',
    };

    if (country) where.country = country;
    if (operator) where.operator = operator;

    const [totalTransactions, totalAmount, totalRefunded] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'refund' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      totalRefunded: totalRefunded._sum.amount || 0,
      netAmount: (totalAmount._sum.amount || 0) - (totalRefunded._sum.amount || 0),
    };
  }

  async getOperators(query: StatisticsQueryDto) {
    const { startDate, endDate, country } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      type: 'topup',
    };

    if (country) where.country = country;

    const operators = await this.prisma.transaction.groupBy({
      by: ['operator'],
      where,
      _count: {
        operator: true,
      },
      _sum: {
        amount: true,
      },
    });

    return operators.map(op => ({
      operator: op.operator,
      totalTransactions: op._count.operator,
      totalAmount: op._sum.amount || 0,
    }));
  }
} 