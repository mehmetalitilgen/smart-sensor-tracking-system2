import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('MQTT')
@ApiBearerAuth()
@Controller('mqtt')
@UseGuards(JwtGuard)
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Get('status')
  @ApiOperation({ summary: 'MQTT bağlantı durumunu kontrol et' })
  @ApiResponse({ status: 200, description: 'Bağlantı durumu başarıyla döndürüldü' })
  async getStatus() {
    return { status: 'connected' };
  }

  @Post('publish')
  @ApiOperation({ summary: 'MQTT üzerinden mesaj yayınla' })
  @ApiResponse({ status: 201, description: 'Mesaj başarıyla yayınlandı' })
  async publish(@Body() data: any) {
    await this.mqttService.publish('sensors/data', JSON.stringify(data));
    return { status: 'published' };
  }

  @Get('subscribe')
  @ApiOperation({ summary: 'MQTT topic\'ine abone ol' })
  @ApiResponse({ status: 200, description: 'Topic\'e başarıyla abone olundu' })
  async subscribe(@Query('topic') topic: string) {
    await this.mqttService.subscribe(topic);
    return { status: 'subscribed' };
  }
} 