import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { Operator } from '@prisma/client';

@Controller('operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get()
  async findAll(): Promise<Operator[]> {
    return this.operatorService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Operator | null> {
    return this.operatorService.findById(id);
  }

  @Get('operator-id/:operatorId')
  async findByOperatorId(@Param('operatorId') operatorId: number): Promise<Operator | null> {
    return this.operatorService.findByOperatorId(operatorId);
  }

  @Post()
  async create(@Body() data: any): Promise<Operator> {
    return this.operatorService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Operator> {
    return this.operatorService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Operator> {
    return this.operatorService.delete(id);
  }
} 