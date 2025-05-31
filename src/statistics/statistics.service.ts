import { Injectable } from '@nestjs/common';
import { PrismaClient, DailyStatistic } from '@prisma/client';

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
} 