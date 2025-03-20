import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Updated Company Name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
