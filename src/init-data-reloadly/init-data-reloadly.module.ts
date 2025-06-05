import { Module } from '@nestjs/common';
import { InitDataReloadlyController } from './init-data-reloadly.controller';
import { InitDataReloadlyService } from './init-data-reloadly.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [InitDataReloadlyController],
  providers: [InitDataReloadlyService],
  imports: [PrismaModule]
})
export class InitDataReloadlyModule { }
