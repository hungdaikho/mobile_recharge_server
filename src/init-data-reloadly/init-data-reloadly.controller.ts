import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { InitDataReloadlyService } from './init-data-reloadly.service';

@Controller('init-data-reloadly')
export class InitDataReloadlyController {
    public constructor(private readonly initDataReloadlyService: InitDataReloadlyService) { }
    // Public endpoint - không cần authentication
    @Public()
    @Get('public')
    getPublicData() {
        return { message: 'This is public data' };
    }
    // @UseGuards(JwtAuthGuard)
    @Public()
    @Get('token')
    getToken() {
        return this.initDataReloadlyService.getToken();
    }
    // Protected endpoint - yêu cầu JWT authentication
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtectedData() {
        return { message: 'This is protected data' };
    }

    // Role-based endpoint - yêu cầu JWT authentication và role cụ thể
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin-only')
    getAdminData() {
        return { message: 'This is admin only data' };
    }
}
