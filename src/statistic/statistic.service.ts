import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticService {
    constructor(private prisma: PrismaService) {}
    async getAllTransaction(){
        const transactions = await this.prisma.transaction.findMany() 
        return transactions
    }
    
    async getTransactionsByFilter({ fromDate, toDate, country, operator, status }: { fromDate?: string, toDate?: string, country?: string, operator?: string, status?: string }) {
        const where: any = {};
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) {
                where.createdAt.gte = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
            }
            if (toDate) {
                where.createdAt.lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
            }
        }
        if (country) where.country = country;
        if (operator) where.operator = String(operator);
        if (status) where.status = status;

        return this.prisma.transaction.findMany({ where });
    }
}
