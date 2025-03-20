import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies";
import { LogViewModule } from '../log-view/log-view.module'; 

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secretkey',
      signOptions: { expiresIn: '1d' },
    }),
    LogViewModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
