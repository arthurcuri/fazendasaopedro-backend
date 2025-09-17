// src/auth/auth.service.ts
import { Injectable }     from '@nestjs/common';
import { JwtService }     from '@nestjs/jwt';
import { UserService }    from '../user/user.service';
import * as bcrypt        from 'bcrypt';
import { CreateUserDto }  from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService:   JwtService,
  ) {}


  async validateUser(email: string, senha: string) {
    console.log('>> validateUser recebido:', { email, senha });

    const user = await this.usersService.findByEmail(email);
    console.log('>> usuário do banco encontrado:', user);

    if (user) {
      const ok = await bcrypt.compare(senha, user.senha);
      console.log('>> bcrypt.compare deu:', ok);

      if (ok) {
        const { senha, ...rest } = user;
        console.log('>> validação bem‐sucedida, retornando usuário:', rest);
        return rest;
      } else {
        console.log('>> senha inválida');
      }
    } else {
      console.log('>> nenhum usuário com esse e-mail');
    }

    console.log('>> validateUser retornando null');
    return null;
  }

  async register(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  
  async resetPassword(email: string, novaSenha: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.usersService.updatePassword(user.id, novaSenha);
    return { message: 'Senha redefinida com sucesso' };
  }
}
