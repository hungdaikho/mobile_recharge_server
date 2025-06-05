import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Operator, Prisma } from '@prisma/client';

type OperatorCreateInput = Prisma.OperatorCreateInput;
type OperatorUpdateInput = Prisma.OperatorUpdateInput;
type OperatorWhereInput = Prisma.OperatorWhereInput;

@Injectable()
export class OperatorService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Operator[]> {
    return this.prisma.operator.findMany({
      include: {
        country: true,
        simTypes: true,
      },
    });
  }

  async findById(id: string): Promise<Operator> {
    const operator = await this.prisma.operator.findUnique({
      where: { id },
      include: {
        country: true,
        simTypes: true,
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operator with ID ${id} not found`);
    }

    return operator;
  }

  async findByOperatorId(operatorId: number): Promise<Operator> {
    const operator = await this.prisma.operator.findFirst({
      where: {
        operatorId: operatorId
      } as OperatorWhereInput,
      include: {
        country: true,
        simTypes: true,
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operator with operatorId ${operatorId} not found`);
    }

    return operator;
  }

  async create(data: OperatorCreateInput): Promise<Operator> {
    return this.prisma.operator.create({
      data,
      include: {
        country: true,
        simTypes: true,
      },
    });
  }

  async update(id: string, data: OperatorUpdateInput): Promise<Operator> {
    try {
      return await this.prisma.operator.update({
        where: { id },
        data,
        include: {
          country: true,
          simTypes: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Operator with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Operator> {
    try {
      return await this.prisma.operator.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Operator with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
} 