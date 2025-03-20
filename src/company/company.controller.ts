import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { Role } from '@prisma/client';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Roles(Role.SYSTEM_ADMIN)
  @Post()
  create(@Body() dto: CreateCompanyDto, @CurrentUser() user) {
    return this.companyService.createCompany(dto.name, user);
  }

  @Get()
  getAll() {
    return this.companyService.getAllCompanies();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.getCompanyById(id);
  }

  @Roles(Role.SYSTEM_ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto, @CurrentUser() user) {
    return this.companyService.updateCompany(id, dto.name, user);
  }

  @Roles(Role.SYSTEM_ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.companyService.deleteCompany(id, user);
  }
}
