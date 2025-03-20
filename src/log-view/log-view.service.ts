import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogViewDto } from './dto'
@Injectable()
export class LogViewService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLogViewDto) {
    return this.prisma.logView.create({
      data: {
        userId: dto.userId,
        action: dto.action,
      },
    });
  }

  async findAll() {
    return this.prisma.logView.findMany({
      include: { user: true },
      orderBy: { timestamp: 'desc' },
    });
  }
}
