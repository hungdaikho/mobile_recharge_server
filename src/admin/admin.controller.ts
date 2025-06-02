import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';

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

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    // req.user chứa { sub, username, role }
    const user = await this.adminService.findByUsername(req.user.username);
    if (!user) return null;
    const { passwordHash, ...userInfo } = user;
    return userInfo;
  }
} 