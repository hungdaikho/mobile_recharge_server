import { Injectable } from '@nestjs/common';
import { PrismaClient, ActivityLog } from '@prisma/client';

@Injectable()
export class ActivityLogService {
  private prisma = new PrismaClient();

  async getLogs({ phoneNumber, date, page = 1, limit = 20 }: any): Promise<{ items: ActivityLog[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (phoneNumber) where.phoneNumber = phoneNumber;
    if (date) {
      const d = new Date(date);
      where.createdAt = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lt: new Date(d.setHours(24, 0, 0, 0)),
      };
    }
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);
    return { items, total, page, limit };
  }
} 