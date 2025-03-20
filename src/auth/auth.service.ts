import { BadRequestException, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto";
import { LogViewService } from "../log-view/log-view.service";
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logViewService: LogViewService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        companyId: dto.companyId ?? null,
      },
    });

    await this.logViewService.create({
        userId: user.id,
        action: 'User registered',
      });

    const payload = {
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    };
    const token = await this.jwtService.signAsync(payload);

    return { message: 'User registered successfully', userId: user.id, access_token: token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.password, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    };

    const token = await this.jwtService.signAsync(payload);
    await this.logViewService.create({
        userId: user.id,
        action: 'User logged in',
    });

    return { access_token: token };
  }

  async createUser(dto: CreateUserDto, currentUser: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    if (currentUser.role === 'COMPANY_ADMIN') {
      if (dto.companyId && dto.companyId !== currentUser.companyId) {
        throw new ForbiddenException('You can only add users to your own company');
      }
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        companyId: dto.companyId ?? null,
      },
    });

    await this.logViewService.create({
        userId: currentUser.userId,
        action: `Created user: ${dto.email}`,
      });

    return { message: 'User created successfully', userId: user.id };
  }
}
