import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SensorDataGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    console.log('Mesaj alındı:', message);
  }

  broadcastSensorData(data: any): void {
    this.server.emit('sensorData', data);
  }
}
