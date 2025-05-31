import { Injectable } from '@nestjs/common';
import { PrismaClient, NewsPost } from '@prisma/client';

@Injectable()
export class NewsService {
  private prisma = new PrismaClient();

  async create(data: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsPost> {
    return this.prisma.newsPost.create({ data });
  }

  async update(id: string, data: Partial<NewsPost>): Promise<NewsPost> {
    return this.prisma.newsPost.update({ where: { id }, data });
  }

  async delete(id: string): Promise<NewsPost> {
    return this.prisma.newsPost.delete({ where: { id } });
  }

  async getAll({ isPublished }: { isPublished?: boolean } = {}): Promise<NewsPost[]> {
    return this.prisma.newsPost.findMany({
      where: isPublished !== undefined ? { isPublished } : undefined,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getBySlug(slug: string): Promise<NewsPost | null> {
    return this.prisma.newsPost.findUnique({ where: { slug } });
  }
} 