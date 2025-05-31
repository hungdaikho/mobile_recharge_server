import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

class CreateAdminDto {
  username: string;
  passwordHash: string;
  role: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
} 