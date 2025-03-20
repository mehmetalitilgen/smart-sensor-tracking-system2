import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { SensorDataModule } from '../sensor-data/sensor-data.module';
import { InfluxDBModule } from '../influxdb/influxdb.module';

@Module({
  imports: [SensorDataModule, InfluxDBModule],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
