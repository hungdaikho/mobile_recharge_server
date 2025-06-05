import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiCredentialsService } from './api-credentials.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('api-credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api-credentials')
export class ApiCredentialsController {
  constructor(private readonly apiCredentialsService: ApiCredentialsService) {}

  @Post()
  create(@Body() createApiCredentialDto: {
    name: string;
    type: string;
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
    metadata?: any;
  }) {
    return this.apiCredentialsService.create(createApiCredentialDto);
  }

  @Get()
  findAll() {
    return this.apiCredentialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiCredentialsService.findOne(id);
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateApiCredentialDto: {
      name?: string;
      type?: string;
      apiKey?: string;
      apiSecret?: string;
      baseUrl?: string;
      isActive?: boolean;
      metadata?: any;
      webhook?: string;
    },
  ) {
    return this.apiCredentialsService.update(id, updateApiCredentialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiCredentialsService.delete(id);
  }
} 