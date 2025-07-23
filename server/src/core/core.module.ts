import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.util';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { getGrapgQLConfig } from './config/graphql.config';
import { RedisModule } from './redis/redis.module';
import { AccountModule } from '../modules/auth/account/account.module';
import { SessionModule } from '../modules/auth/session/session.module';
import { TotpModule } from '../modules/auth/totp/totp.module';
import { DeactivateModule } from '../modules/auth/deactivate/deactivate.module';
import { CronModule } from '../modules/cron/cron.module';
import { StorageModule } from '../modules/libs/storage/storage.module';
import { ProfileModule } from '../modules/auth/profile/profile.module';
import { StreamModule } from '../modules/stream/stream.module';
import { LivekitModule } from '../modules/libs/livekit/livekit.module';
import { getLiveKitConfig } from './config/livekit.config';
import { IngressModule } from '../modules/stream/ingress/ingress.module';
import { WebhookModule } from '../modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true
  }),
  GraphQLModule.forRootAsync({
    driver: ApolloDriver,
    imports: [ConfigModule],
    useFactory: getGrapgQLConfig,
    inject: [ConfigService]
  }),
  PrismaModule,
  RedisModule,
  AccountModule,
  LivekitModule.registerAsync({
    imports: [ConfigModule],
    useFactory: getLiveKitConfig,
    inject: [ConfigService]
  }),
  SessionModule,
  TotpModule,
  DeactivateModule,
  CronModule,
  StorageModule,
  ProfileModule,
  StreamModule,
  IngressModule,
  WebhookModule,

  ],

})
export class CoreModule {}
