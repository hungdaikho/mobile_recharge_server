import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReloadlyModule } from '../reloadly/reloadly.module';

@Module({
  imports: [PrismaModule,ReloadlyModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule {}
