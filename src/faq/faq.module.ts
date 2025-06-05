import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FaqController],
  providers: [FaqService],
  imports: [PrismaModule]
})
export class FaqModule {}
