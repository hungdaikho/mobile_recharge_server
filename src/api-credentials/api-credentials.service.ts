import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiCredential } from '@prisma/client';

@Injectable()
export class ApiCredentialsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ApiCredential[]> {
    return this.prisma.apiCredential.findMany();
  }

  async findOne(id: string): Promise<ApiCredential | null> {
    return this.prisma.apiCredential.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<ApiCredential | null> {
    return this.prisma.apiCredential.findUnique({
      where: { name },
    });
  }

  async create(data: {
    name: string;
    type: string;
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
    metadata?: any;
  }): Promise<ApiCredential> {
    return this.prisma.apiCredential.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      type?: string;
      apiKey?: string;
      apiSecret?: string;
      baseUrl?: string;
      isActive?: boolean;
      metadata?: any;
    },
  ): Promise<ApiCredential> {
    return this.prisma.apiCredential.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<ApiCredential> {
    return this.prisma.apiCredential.delete({
      where: { id },
    });
  }
} 