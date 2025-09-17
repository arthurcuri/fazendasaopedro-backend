import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';


@ApiTags('cliente')
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}



  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  @ApiBody({ type: CreateClienteDto })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.', schema: { example: { id: 1, nome: 'Maria', endereco: 'Rua A, 123', bairro: 'Centro', status: 'semanal', dezenas_padrao: 10, pentes_padrao: 2, status_pagamento: 'pago', observacoes: '' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }


  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes.', schema: { example: [{ id: 1, nome: 'Maria', endereco: 'Rua A, 123', bairro: 'Centro', status: 'ativo', dezenas_padrao: 10, pentes_padrao: 2, status_pagamento: 'pago', observacoes: '' }] } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async findAll() {
    return this.clienteService.findAll();
  }


  @Get(':id')
  @ApiOperation({ summary: 'Busca um cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.', schema: { example: { id: 1, nome: 'Maria', endereco: 'Rua A, 123', bairro: 'Centro', status: 'ativo', dezenas_padrao: 10, pentes_padrao: 2, status_pagamento: 'pago', observacoes: '' } } })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.', schema: { example: { statusCode: 404, message: 'Cliente não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async findOne(@Param('id') id: string) {
    return this.clienteService.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um cliente', description: 'Atualiza os dados de um cliente existente. Informe apenas os campos que deseja alterar.' })
  @ApiBody({ type: UpdateClienteDto, description: 'Corpo da requisição para atualizar um cliente', examples: {
    exemplo: {
      summary: 'Exemplo de atualização',
      value: {
        nome: 'Novo Nome',
        endereco: 'Rua Nova, 456',
        bairro: 'Centro',
        status: 'chamar',
        dezenas_padrao: 12,
        pentes_padrao: 3,
        status_pagamento: 'pago',
        observacoes: 'Cliente atualizado via API.'
      }
    }
  } })
  @ApiResponse({ status: 200, description: 'Cliente atualizado.', schema: { example: { id: 1, nome: 'Maria', endereco: 'Rua Nova, 456', bairro: 'Centro', status: 'chamar', dezenas_padrao: 12, pentes_padrao: 3, status_pagamento: 'pago', observacoes: 'Cliente atualizado via API.' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.', schema: { example: { statusCode: 404, message: 'Cliente não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(+id, updateClienteDto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Remove um cliente' })
  @ApiResponse({ status: 200, description: 'Cliente removido.', schema: { example: { message: 'Cliente removido com sucesso.' } } })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.', schema: { example: { statusCode: 404, message: 'Cliente não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}
