import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Public()
  @Get()
  async findAll() {
    return this.operatorService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('admin')
  async findAllAdmin() {
    return this.operatorService.findAllAdmin();
  }
  @Public()
  @Get(':countryCode')
  async findAllByCountryCode(@Param('countryCode') countryCode: string) {
    return this.operatorService.findAllByCountryCode(countryCode);
  }
  @UseGuards(AuthGuard)
  @Post()
  async updateOperatorActive(@Body() data: any) {
    return this.operatorService.updateOperatorActive(data.operatorId,data.active,data.color,data.description);
  }
  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.operatorService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.operatorService.delete(id);
  }
} 