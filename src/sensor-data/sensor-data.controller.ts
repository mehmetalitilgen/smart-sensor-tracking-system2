import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SensorDataService } from './sensor-data.service';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags('Sensor Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sensor-data')
export class SensorDataController {
  constructor(private sensorDataService: SensorDataService) {}

  @Post()
  createSensorData(@Body() data: CreateSensorDataDto ) {
    return this.sensorDataService.createSensorData(data);
  }

  @Get()
  getSensorData() {
    return this.sensorDataService.getAllSensorData();
  }

  @Get(':id')  
  getSensorDataById(@Param('id') id: number) {
    return this.sensorDataService.getSensorDataById(Number(id));
  }

  @Delete(':id')  
  deleteSensorData(@Param('id') id: number) {
    return this.sensorDataService.deleteSensorData(Number(id));
  }

  @Get('range') 
  getSensorDataByRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('sensorId') sensorId: string,
  ) {
    return this.sensorDataService.getSensorDataByRange(startTime, endTime, sensorId);
  }
}
