
import {Controller, Post,Get,Body,Request,UseGuards,UnauthorizedException,Patch} from '@nestjs/common';
import { AuthService }    from './auth.service';
import { CreateUserDto }  from '../user/dto/create-user.dto';
import { LoginUserDto }   from '../user/dto/LoginUserDto';
import { JwtAuthGuard }   from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.authService.register(dto);
    const { senha, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

 

  @Post('login')
  @ApiOperation({ summary: 'Realiza login do usuário' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  async login(@Body() dto: LoginUserDto) {
    const user = await this.authService.validateUser(dto.email, dto.senha);
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    return this.authService.login(user);
  }

  

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado.' })
  me(@Request() req) {
    return { user: req.user };
  }


  @Patch('reset-password')
  @ApiOperation({ summary: 'Reseta a senha do usuário' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, novaSenha: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Senha resetada com sucesso.' })
  async resetPassword(@Body() dto: { email: string; novaSenha: string }) {
    const result = await this.authService.resetPassword(dto.email, dto.novaSenha);
    return result;
  }
}
