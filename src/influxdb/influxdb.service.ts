import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxDBService {
  private readonly logger = new Logger(InfluxDBService.name);
  private influxDB: InfluxDB;
  private writeApi;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('INFLUXDB_URL', 'http://localhost:8086');
    const token = this.configService.get<string>('INFLUXDB_TOKEN', 'default-token');
    const org = this.configService.get<string>('INFLUXDB_ORG', 'default-org');
    const bucket = this.configService.get<string>('INFLUXDB_BUCKET', 'sensor_data');
    

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ms');
    this.writeApi.useDefaultTags({ app: 'smart_sensor_tracking' });

    this.logger.log(`Connected to InfluxDB at ${url}`);
  }

  async writeSensorData(sensorId: string, temperature: number, humidity: number, timestamp: Date) {
    try {
      const point = new Point('sensor_data')
        .tag('sensor_id', sensorId)
        .floatField('temperature', temperature)
        .floatField('humidity', humidity)
        .timestamp(timestamp);

      this.writeApi.writePoint(point);
      await this.writeApi.flush();

      this.logger.log(`📊 Sensor data written to InfluxDB: ${sensorId}`);
    } catch (error) {
      this.logger.error('❌ Error writing to InfluxDB', error);
    }
  }
}
