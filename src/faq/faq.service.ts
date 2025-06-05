import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FaqService {
    constructor(private readonly prisma: PrismaService) { }
    async getFaq() {
        return this.prisma.fAQ.findMany()
    }
    async createFaq(dto: any) {
        return this.prisma.fAQ.create({
            data: dto
        })
    }
    async updateFaq(id: string, dto: any) {
        return this.prisma.fAQ.update({
            where: { id },
            data: dto
        })
    }
    async deleteFaq(id: string) {
        return this.prisma.fAQ.delete({
            where: { id }
        })
    }
}
