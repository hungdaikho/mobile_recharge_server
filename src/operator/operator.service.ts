import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperatorService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.operator.findMany({ where: { active: true } });
  }
  async findAllAdmin(){
    return this.prisma.operator.findMany();
  }
  async findAllByCountryCode(countryCode: string) {
    return this.prisma.operator.findMany({ 
      where: { 
        countryCode
      },
      include: {
        country: true
      }
    });
  }
  async updateOperatorActive(operatorId: any, active: boolean, color?: string, description?: string) {
    return this.prisma.operator.update({
      where: { id: operatorId },
      data: {
        active: active,
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
      },
    });
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