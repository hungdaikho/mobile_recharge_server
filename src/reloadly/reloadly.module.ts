import { Module } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';
import { ReloadlyController } from './reloadly.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ReloadlyService],
  controllers: [ReloadlyController],
  exports: [ReloadlyService],
  imports: [PrismaModule]
})
export class ReloadlyModule {}
