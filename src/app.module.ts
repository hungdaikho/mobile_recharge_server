import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { NewsModule } from './news/news.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CountryModule } from './country/country.module';
import { OperatorModule } from './operator/operator.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApiCredentialsModule } from './api-credentials/api-credentials.module';
import { InitDataReloadlyModule } from './init-data-reloadly/init-data-reloadly.module';
import { StripeModule } from './stripe/stripe.module';
import { FaqModule } from './faq/faq.module';
import { ReloadlyModule } from './reloadly/reloadly.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 giây
        limit: 400, // 10 requests mỗi 60 giây cho mỗi IP
      },
    ]),
    PrismaModule,
    TransactionsModule,
    AdminModule,
    AuthModule,
    ActivityLogModule,
    NewsModule,
    CountryModule,
    OperatorModule,
    ApiCredentialsModule,
    InitDataReloadlyModule,
    StripeModule,
    FaqModule,
    ReloadlyModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
