import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country, Prisma } from '@prisma/client';

type CountryCreateInput = Prisma.CountryCreateInput;
type CountryUpdateInput = Prisma.CountryUpdateInput;

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Country[]> {
    return this.prisma.country.findMany({
      include: {
        operators: true,
      },
    });
  }

  async findByCode(code: string): Promise<Country> {
    const country = await this.prisma.country.findUnique({
      where: { code },
      include: {
        operators: true,
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    return country;
  }

  async create(data: CountryCreateInput): Promise<Country> {
    return this.prisma.country.create({
      data,
      include: {
        operators: true,
      },
    });
  }

  async update(code: string, data: CountryUpdateInput): Promise<Country> {
    try {
      return await this.prisma.country.update({
        where: { code },
        data,
        include: {
          operators: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Country with code ${code} not found`);
        }
      }
      throw error;
    }
  }

  async delete(code: string): Promise<Country> {
    try {
      return await this.prisma.country.delete({
        where: { code },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Country with code ${code} not found`);
        }
      }
      throw error;
    }
  }

  async findByContinent(continent: string): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: {
        continent: {
          equals: continent,
          mode: 'insensitive',
        },
      },
      include: {
        operators: true,
      },
    });
  }

  async findByCurrencyCode(currencyCode: string): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: {
        currencyCode: {
          equals: currencyCode,
          mode: 'insensitive',
        },
      },
      include: {
        operators: true,
      },
    });
  }
} 