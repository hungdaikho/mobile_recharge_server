import { Injectable } from '@nestjs/common';
import { PrismaClient, Transaction, ActivityLog } from '@prisma/client';

@Injectable()
export class TransactionsService {
  private prisma = new PrismaClient();

  private async mockTelcoApi(dto: any): Promise<'success' | 'failed'> {
    // Giả lập gọi telco, random thành công/thất bại
    return Math.random() > 0.2 ? 'success' : 'failed';
  }

  private async logActivity(phoneNumber: string, action: string, metadata: any): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        phoneNumber,
        action,
        metadata,
      },
    });
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { status?: string }): Promise<Transaction> {
    // 1. Tạo transaction với status pending nếu chưa có
    const transaction = await this.prisma.transaction.create({ data: { ...data, status: data.status || 'pending' } });
    // 2. Gọi telco API (mock)
    const telcoResult = await this.mockTelcoApi(data);
    // 3. Cập nhật status
    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: telcoResult },
    });
    // 4. Ghi log
    await this.logActivity(transaction.phoneNumber, 'topup', { transactionId: transaction.id, status: telcoResult });
    // 5. Trả về transaction đã cập nhật
    return updated;
  }

  async getTransactions({ date, country, status, operator, page = 1, limit = 20, sort = 'createdAt', order = 'desc' }: any) {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      where.createdAt = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lt: new Date(d.setHours(24, 0, 0, 0)),
      };
    }
    if (country) where.country = country;
    if (status) where.status = status;
    if (operator) where.operator = operator;
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
