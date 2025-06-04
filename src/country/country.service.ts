import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({ include: { operators: true } });
  }

  async create(data: any) {
    return this.prisma.country.create({ data });
  }

  async update(code: string, data: any) {
    return this.prisma.country.update({ where: { code }, data });
  }

  async delete(code: string) {
    return this.prisma.country.delete({ where: { code } });
  }
} 