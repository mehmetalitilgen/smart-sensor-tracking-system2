import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { MqttModule } from './mqtt/mqtt.module';
import { LogViewModule } from './log-view/log-view.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { InfluxDBModule } from './influxdb/influxdb.module';
import * as winston from 'winston';
import { HealthController } from './health/health.controller'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    SensorDataModule,
    MqttModule,
    LogViewModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    InfluxDBModule,
  ],
  controllers: [HealthController], // Eklenen satır
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
