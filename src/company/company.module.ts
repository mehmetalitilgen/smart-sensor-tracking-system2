import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogViewModule } from '../log-view/log-view.module'; 

@Module({
  imports: [PrismaModule, LogViewModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
