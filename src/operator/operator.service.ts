import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperatorService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.operator.findMany({ include: { country: true, simTypes: true } });
  }

  async create(data: any) {
    return this.prisma.operator.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.operator.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.operator.delete({ where: { id } });
  }
} 