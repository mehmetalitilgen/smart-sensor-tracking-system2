import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { SensorDataModule } from '../sensor-data/sensor-data.module';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [SensorDataModule, MqttModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {} 