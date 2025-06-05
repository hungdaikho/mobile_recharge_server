import { Module } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { OperatorController } from './operator.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {} 