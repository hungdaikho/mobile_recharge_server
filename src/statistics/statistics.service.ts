import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StatisticsQueryDto, GroupBy } from './dto/statistics-query.dto';

@Injectable()
export class StatisticsService {
  private prisma = new PrismaClient();

  async getSummary(query: StatisticsQueryDto) {
    const { startDate, endDate, country, operator } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    
    const where: any = {
      createdAt: {
        gte: start,
        lt: end,
      },
      type: 'TOPUP',
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
        where: { ...where, type: 'REFUND' },
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
    end.setDate(end.getDate() + 1);
    
    const where: any = {
      createdAt: {
        gte: start,
        lt: end,
      },
      type: 'TOPUP',
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

    // Lấy danh sách operator code
    const operatorCodes = operators.map(op => op.operator);
    // Lấy thông tin chi tiết từ bảng Operator
    const operatorDetails = await this.prisma.operator.findMany({
      where: { apiCode: { in: operatorCodes } },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        apiCode: true,
        countryCode: true,
        description: true,
        color: true,
      },
    });

    // Map lại kết quả trả về
    return operators.map(op => {
      const detail = operatorDetails.find(o => o.apiCode === op.operator);
      return {
        operator: detail || { apiCode: op.operator },
        totalTransactions: op._count.operator,
        totalAmount: op._sum.amount || 0,
      };
    });
  }
} 