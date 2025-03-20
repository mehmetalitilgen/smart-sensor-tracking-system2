import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogViewService } from '../log-view/log-view.service';
import { CurrentUser } from '../auth/decorators'; // Kullanıcı bilgisi için (Controller tarafında alınır)

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private logViewService: LogViewService // LogViewService Inject!
  ) {}

  async createCompany(name: string, currentUser: any) {
    const company = await this.prisma.company.create({
      data: { name },
    });

    // 📌 LogView kayıt:
    await this.logViewService.create({
      userId: currentUser.userId,
      action: `Created company: ${name}`,
    });

    return company;
  }

  async getAllCompanies() {
    return this.prisma.company.findMany();
  }

  async getCompanyById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateCompany(id: number, name: string, currentUser: any) {
    const company = await this.prisma.company.update({
      where: { id },
      data: { name },
    });

    await this.logViewService.create({
      userId: currentUser.userId,
      action: `Updated company: ${name}`,
    });

    return company;
  }

  async deleteCompany(id: number, currentUser: any) {
    const company = await this.prisma.company.delete({
      where: { id },
    });

    await this.logViewService.create({
      userId: currentUser.userId,
      action: `Deleted company: ${company.name}`,
    });

    return company;
  }
}
