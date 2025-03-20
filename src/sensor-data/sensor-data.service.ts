import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SensorDataService {
  constructor(private prisma: PrismaService) {}

  async createSensorData(data: {
    sensorId: string;
    timestamp: Date;
    temperature: number;
    humidity: number;
  }) {
    return this.prisma.sensorData.create({
      data,
    });
  }

  async getAllSensorData() {
    return this.prisma.sensorData.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getSensorDataBySensorId(sensorId: string) {
    return this.prisma.sensorData.findMany({
      where: { sensorId },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getSensorDataById(id: number) {
    const data = await this.prisma.sensorData.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Sensor data not found');
    }
    return data;
  }

  async deleteSensorData(id: number) {
    const data = await this.prisma.sensorData.findUnique({ where: { id } });
    if (!data) {
      throw new NotFoundException('Sensor data not found');
    }
    return this.prisma.sensorData.delete({
      where: { id },
    });
  }

  async getSensorDataByRange(startTime: string, endTime: string, sensorId: string) {
    return this.prisma.sensorData.findMany({
      where: {
        sensorId,
        timestamp: {
          gte: new Date(startTime),
          lte: new Date(endTime),
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
