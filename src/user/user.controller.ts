import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import{ JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport'; 
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';


@ApiTags('user')
@Controller('user')
export class UserController {
  
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService, 
    ) {}
  


  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.', schema: { example: { id: 1, nome: 'admin', email: 'admin@email.com', perfil: 'admin' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.', schema: { example: [{ id: 1, nome: 'admin', email: 'admin@email.com', perfil: 'admin' }] } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.', schema: { example: { id: 1, nome: 'admin', email: 'admin@email.com', perfil: 'admin' } } })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.', schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.', schema: { example: { id: 1, nome: 'admin', email: 'admin@email.com', perfil: 'admin' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.', schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido.', schema: { example: { message: 'Usuário removido com sucesso.' } } })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.', schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
