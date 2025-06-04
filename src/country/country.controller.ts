import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Public()
  @Get()
  async findAll() {
    return this.countryService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any) {
    return this.countryService.create(data);
  }

  @Put(':code')
  @UseGuards(AuthGuard)
  async update(@Param('code') code: string, @Body() data: any) {
    return this.countryService.update(code, data);
  }

  @Delete(':code')
  @UseGuards(AuthGuard)
  async delete(@Param('code') code: string) {
    return this.countryService.delete(code);
  }
} 