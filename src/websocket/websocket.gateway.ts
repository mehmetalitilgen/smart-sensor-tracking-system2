import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { SensorDataService } from '../sensor-data/sensor-data.service';
import { MqttService } from '../mqtt/mqtt.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  constructor(
    private sensorDataService: SensorDataService,
    private mqttService: MqttService,
  ) {
    // MQTT'den gelen verileri WebSocket'e ilet
    this.mqttService.subscribe('sensors/+/data');
    
    // MQTT client'ın message event'ini dinle
    this.mqttService['client'].on('message', (topic: string, message: Buffer) => {
      const sensorId = topic.split('/')[1];
      this.server.emit(`sensor-data/${sensorId}`, JSON.parse(message.toString()));
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('subscribe-sensor')
  async handleSubscribeSensor(client: Socket, sensorId: string) {
    client.join(`sensor-${sensorId}`);
    
    // Son verileri gönder
    const data = await this.sensorDataService.getSensorDataBySensorId(sensorId);
    const lastData = data[0]; // İlk veri en son veri olacak (timestamp desc sıralı)
    if (lastData) {
      client.emit(`sensor-data/${sensorId}`, lastData);
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('unsubscribe-sensor')
  handleUnsubscribeSensor(client: Socket, sensorId: string) {
    client.leave(`sensor-${sensorId}`);
  }

  // Tüm bağlı istemcilere veri yayını yap
  broadcastSensorData(sensorId: string, data: any) {
    this.server.to(`sensor-${sensorId}`).emit(`sensor-data/${sensorId}`, data);
  }
} 