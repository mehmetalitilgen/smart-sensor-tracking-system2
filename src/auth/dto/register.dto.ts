import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  companyId?: number;
}
