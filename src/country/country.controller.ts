import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CountryService } from './country.service';

// Placeholder guard, thay bằng guard thực tế của bạn
const AuthGuard = () => (target: any, key?: any, descriptor?: any) => descriptor;

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  async findAll() {
    return this.countryService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() data: any) {
    return this.countryService.create(data);
  }

  @Put(':code')
  @UseGuards(AuthGuard())
  async update(@Param('code') code: string, @Body() data: any) {
    return this.countryService.update(code, data);
  }

  @Delete(':code')
  @UseGuards(AuthGuard())
  async delete(@Param('code') code: string) {
    return this.countryService.delete(code);
  }
} 