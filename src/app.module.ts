import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NewsModule } from './news/news.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CountryModule } from './country/country.module';
import { OperatorModule } from './operator/operator.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApiCredentialsModule } from './api-credentials/api-credentials.module';

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
    StatisticsModule,
    NewsModule,
    CountryModule,
    OperatorModule,
    ApiCredentialsModule
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
