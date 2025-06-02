import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';

// Placeholder guard, thay bằng guard thực tế của bạn
const AuthGuard = () => (target: any, key?: any, descriptor?: any) => descriptor;

@Controller('operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get()
  async findAll() {
    return this.operatorService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() data: any) {
    return this.operatorService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(@Param('id') id: string, @Body() data: any) {
    return this.operatorService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async delete(@Param('id') id: string) {
    return this.operatorService.delete(id);
  }
} 