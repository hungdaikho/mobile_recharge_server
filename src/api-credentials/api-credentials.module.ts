import { Module } from '@nestjs/common';
import { ApiCredentialsService } from './api-credentials.service';
import { ApiCredentialsController } from './api-credentials.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiCredentialsController],
  providers: [ApiCredentialsService],
  exports: [ApiCredentialsService],
})
export class ApiCredentialsModule {} 