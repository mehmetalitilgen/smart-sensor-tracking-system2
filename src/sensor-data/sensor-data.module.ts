import { Module } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { SensorDataController } from './sensor-data.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SensorDataGateway } from './sensor-data.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [SensorDataController],
  providers: [SensorDataService, SensorDataGateway],
  exports: [SensorDataService, SensorDataGateway], 
})
export class SensorDataModule {}
