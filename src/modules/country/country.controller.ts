import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from '@prisma/client';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  async findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }

  @Get(':code')
  async findByCode(@Param('code') code: string): Promise<Country> {
    return this.countryService.findByCode(code);
  }

  @Get('continent/:continent')
  async findByContinent(@Param('continent') continent: string): Promise<Country[]> {
    return this.countryService.findByContinent(continent);
  }

  @Get('currency/:currencyCode')
  async findByCurrencyCode(@Param('currencyCode') currencyCode: string): Promise<Country[]> {
    return this.countryService.findByCurrencyCode(currencyCode);
  }

  @Post()
  async create(@Body() data: any): Promise<Country> {
    return this.countryService.create(data);
  }

  @Put(':code')
  async update(@Param('code') code: string, @Body() data: any): Promise<Country> {
    return this.countryService.update(code, data);
  }

  @Delete(':code')
  async delete(@Param('code') code: string): Promise<Country> {
    return this.countryService.delete(code);
  }
} 