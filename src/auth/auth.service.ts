import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly adminService: AdminService) {}

  async validateUser(username: string, passwordHash: string): Promise<any> {
    const user = await this.adminService.findByUsername(username);
    if (user && user.passwordHash === passwordHash) {
      return user;
    }
    return null;
  }

  async login(username: string, passwordHash: string) {
    const user = await this.validateUser(username, passwordHash);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    const { passwordHash: _, ...userInfo } = user;
    return { access_token: token, user: userInfo };
  }
} 