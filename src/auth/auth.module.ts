import { Module }                      from '@nestjs/common';
import { PassportModule }              from '@nestjs/passport';
import { JwtModule }                   from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService }                 from './auth.service';
import { AuthController }              from './auth.controller';
import { JwtStrategy }                 from './Strategies/jwt.strategy';
import { JwtAuthGuard }                from './jwt-auth.guard';
import { UserModule }                  from '../user/user.module';

@Module({
  imports: [
    ConfigModule,  
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cs: ConfigService) => ({
  secret:      cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cs.get<string>('JWT_EXPIRES_IN', '3600s') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,  
  ],
  exports: [AuthService],
})
export class AuthModule {}
