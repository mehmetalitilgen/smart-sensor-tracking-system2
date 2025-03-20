import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxDBService } from './influxdb.service';

@Module({
  imports: [ConfigModule],
  providers: [InfluxDBService],
  exports: [InfluxDBService],
})
export class InfluxDBModule {}
