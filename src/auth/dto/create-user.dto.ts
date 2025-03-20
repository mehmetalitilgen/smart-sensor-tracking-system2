import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'New User' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'userPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  companyId?: number;
}
