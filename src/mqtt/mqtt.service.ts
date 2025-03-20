import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { SensorDataService } from '../sensor-data/sensor-data.service';
import { InfluxDBService } from '../influxdb/influxdb.service';
import { SensorDataGateway } from '../sensor-data/sensor-data.gateway'; // 🚀 WebSocket Gateway
import * as fs from 'fs';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private sensorDataService: SensorDataService,
    private influxDBService: InfluxDBService,
    private sensorDataGateway: SensorDataGateway, // 🚀 Inject ettik!
  ) {}

  async onModuleInit() {
    this.logger.log('MQTTService initialized 🚀');
    this.connectToBroker();
  }

  connectToBroker() {
    this.logger.log('Attempting to connect to MQTT Broker...');

    this.client = connect('mqtts://localhost:8883', {
      rejectUnauthorized: false,
      ca: [fs.readFileSync('./mosquitto/certs/mosquitto-ca.crt')],
      key: fs.readFileSync('./mosquitto/certs/mosquitto-server.key'),
      cert: fs.readFileSync('./mosquitto/certs/mosquitto-server.crt'),
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to MQTT Broker!');

      this.client.subscribe('sensors/data', (err) => {
        if (err) {
          this.logger.error('❌ Subscription error:', err);
        } else {
          this.logger.log('📡 Subscribed to sensors/data topic');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        this.logger.log(`📥 Received message: ${JSON.stringify(payload)}`);

        if (
          payload.sensor_id &&
          payload.timestamp &&
          payload.temperature !== undefined &&
          payload.humidity !== undefined
        ) {
          const timestamp = new Date(payload.timestamp * 1000);

          // PostgreSQL'e kaydet
          await this.sensorDataService.createSensorData({
            sensorId: payload.sensor_id,
            timestamp: timestamp,
            temperature: payload.temperature,
            humidity: payload.humidity,
          });
          this.logger.log(`✅ Sensor data saved to PostgreSQL: ${payload.sensor_id}`);

          // InfluxDB'ye kaydet
          await this.influxDBService.writeSensorData(
            payload.sensor_id,
            payload.temperature,
            payload.humidity,
            timestamp,
          );
          this.logger.log(`✅ Sensor data saved to InfluxDB: ${payload.sensor_id}`);

          // 🚀 WebSocket ile yayınla!
          this.sensorDataGateway.broadcastSensorData({
            sensorId: payload.sensor_id,
            timestamp: timestamp,
            temperature: payload.temperature,
            humidity: payload.humidity,
          });
          this.logger.log(`📡 Sensor data broadcasted via WebSocket: ${payload.sensor_id}`);

        } else {
          this.logger.warn('⚠️ Invalid sensor data format');
        }
      } catch (err) {
        this.logger.error('❌ Error processing message:', err);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ MQTT Client Error: ${err.message}`);
    });

    this.client.on('close', () => {
      this.logger.warn('⚠️ MQTT Client Disconnected');
    });
  }

  async publish(topic: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(topic, message, (error) => {
        if (error) {
          this.logger.error(`❌ Error publishing message: ${error.message}`);
          reject(error);
        } else {
          this.logger.log(`✅ Message published to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (error) => {
        if (error) {
          this.logger.error(`❌ Error subscribing to topic: ${error.message}`);
          reject(error);
        } else {
          this.logger.log(`✅ Subscribed to topic: ${topic}`);
          resolve();
        }
      });
    });
  }
}
