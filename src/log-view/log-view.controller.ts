import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LogViewService } from './log-view.service';
import { CreateLogViewDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Log View')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('log-view')
export class LogViewController {
  constructor(private readonly logViewService: LogViewService) {}

  @Post()
  @Roles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN)
  create(@Body() dto: CreateLogViewDto) {
    return this.logViewService.create(dto);
  }

  @Get()
  @Roles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN)
  findAll() {
    return this.logViewService.findAll();
  }
}
