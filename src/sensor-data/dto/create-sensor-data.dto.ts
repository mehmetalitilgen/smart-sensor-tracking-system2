import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSensorDataDto {
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @IsNumber()
  timestamp: number; 

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;
}
