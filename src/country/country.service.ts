import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.country.findMany({
      where: { active: true },
    });
  }
  async findAllAdmin() {
    return this.prisma.country.findMany()
  }
  async updateCountryActive(code: string, active: boolean) {
    const country = await this.prisma.country.findUnique({ where: { code } });

    if (!country) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    return this.prisma.country.update({
      where: { code },
      data: { active },
    });
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