import { Injectable } from '@nestjs/common';
import { PrismaClient, AdminUser } from '@prisma/client';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  async createAdmin(data: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    return this.prisma.adminUser.create({ data });
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { username } });
  }
} 