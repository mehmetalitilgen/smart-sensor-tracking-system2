import { Body, Controller, Post, UseGuards , HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles, CurrentUser } from './decorators';
import { Role } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto){
        return this.authService.login(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN)
    @Post('create-user')
    createUser(@Body() dto: CreateUserDto, @CurrentUser() user) {
      return this.authService.createUser(dto, user);
    }
}