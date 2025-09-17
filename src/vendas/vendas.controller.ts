import {Controller, Post,Get,Param,Body,Delete,ParseIntPipe,Patch,Query,BadRequestException} from '@nestjs/common';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';
import { Venda } from './entities/venda.entity';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

export class Produto {
  id_produto: number;
}

export enum PeriodType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@ApiTags('vendas')
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}


  @Post()
  @ApiOperation({ summary: 'Cria uma nova venda' })
  @ApiBody({ type: CreateVendaDto })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.', schema: { example: { id: 1, dataVenda: '2025-08-24', cliente: { id: 1, nome: 'João' }, itens: [], valorTotal: 100.0 } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  create(@Body() dto: CreateVendaDto): Promise<Venda> {
    return this.vendasService.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Lista todas as vendas' })
  @ApiResponse({ status: 200, description: 'Lista de vendas.', schema: { example: [{ id: 1, dataVenda: '2025-08-24', cliente: { id: 1, nome: 'João' }, itens: [], valorTotal: 100.0 }] } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async findAll(): Promise<(Venda & { id_produto: number[] })[]> {
    const vendas = await this.vendasService.findAll(); 
    return vendas.map(v => ({
      ...v,
      id_produto: v.itens.map(i => i.produto.id)
    }));
  }


  @Get('vendas-por-mes-historico')
  @ApiOperation({ summary: 'Histórico de vendas por mês' })
  @ApiResponse({ status: 200, description: 'Histórico de vendas por mês.', schema: { example: [{ label: 'Jan/2025', sales: 10, revenue: 1000, pago: 800, aReceber: 200 }] } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  getVendasPorMesHistorico() {
    return this.vendasService.getVendasPorMesHistorico();
  }



  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard de vendas', description: 'Retorna dados agregados para o dashboard de vendas, podendo filtrar por período semanal ou mensal.' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard retornados com sucesso.', schema: { example: { totalVendas: 10, faturamento: 1000, aReceber: 200, mediaOvosPorCliente: 12, clientesNovos: 2, vendasPorDiaOuMes: [{ label: 'Seg', sales: 2, revenue: 200 }], clientesDestaque: [{ nome: 'João', compras: 5, media_ovos: 12, ultimoPedido: '24/08/2025' }] } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Período inválido. Use "weekly" ou "monthly".', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async getDashboard(
    @Query('period') period: string = 'weekly',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (period !== 'weekly' && period !== 'monthly') {
      throw new BadRequestException('Período inválido. Use "weekly" ou "monthly".');
    }
    return this.vendasService.getDashboardReport(period as 'weekly' | 'monthly', month, year);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Busca uma venda por ID', description: 'Retorna os detalhes de uma venda específica pelo seu ID.' })
  @ApiResponse({ status: 200, description: 'Venda encontrada.', schema: { example: { id: 1, dataVenda: '2025-08-24', cliente: { id: 1, nome: 'João' }, itens: [], valorTotal: 100.0 } } })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.', schema: { example: { statusCode: 404, message: 'Venda não encontrada', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Venda> {
    return this.vendasService.findOne(id);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma venda', description: 'Remove uma venda específica pelo seu ID.' })
  @ApiResponse({ status: 200, description: 'Venda removida com sucesso.', schema: { example: { message: 'Venda removida com sucesso.' } } })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.', schema: { example: { statusCode: 404, message: 'Venda não encontrada', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vendasService.remove(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma venda', description: 'Atualiza os dados de uma venda existente.' })
  @ApiResponse({ status: 200, description: 'Venda atualizada com sucesso.', schema: { example: { id: 1, dataVenda: '2025-08-24', cliente: { id: 1, nome: 'João' }, itens: [], valorTotal: 120.0 } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.', schema: { example: { statusCode: 404, message: 'Venda não encontrada', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async update(
    @Param('id', ParseIntPipe) id: number,
     @Body() dto: UpdateVendaDto,  
  ): Promise<Venda> {
    console.log('UpdateVendaDto recebido:', dto);
    return this.vendasService.update(id, dto);
  }


  @Post('criar-semana')
  @ApiOperation({ summary: 'Cria vendas para uma semana', description: 'Gera vendas automaticamente para uma semana a partir de uma data inicial.' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Data inicial no formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss',
    example: '2025-08-24'
  })
  @ApiResponse({ status: 201, description: 'Semana criada com sucesso.', schema: { example: { message: '5 vendas criadas para a semana de 24/08 a 30/08', total: 5, debug: [] } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Data inicial inválida', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async criarSemana(
    @Query('startDate') startDate?: string,
  ): Promise<{ message: string; total: number; debug: any[] }> {
    return this.vendasService.criarSemana(startDate);
  }


  @Get('faturamento')
  @ApiOperation({ summary: 'Faturamento total', description: 'Retorna o valor total faturado em vendas.' })
  @ApiOkResponse({ schema: { example: { valor: 1234.56 } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async getFaturamentoTotal() {
    const valor = await this.vendasService.getFaturamentoTotal();
    return { valor };
  }


  @Get('report/por-tipo')
  @ApiOperation({ summary: 'Relatório de vendas por tipo', description: 'Retorna relatório de vendas agrupado por tipo de produto.' })
  @ApiQuery({
    name: 'period',
    required: true,
    type: String,
    description: 'Período do relatório (weekly ou monthly)',
    example: 'monthly'
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Mês (ex: Jan, Fev, Mar, ...). Obrigatório se period=monthly.',
    example: 'Jan'
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Ano (ex: 2025). Obrigatório se period=monthly.',
    example: '2025'
  })
  @ApiResponse({ status: 200, description: 'Relatório por tipo retornado com sucesso.', schema: { example: [{ tipo: 'Ovos', quantidade: 100, vendas: 10 }] } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Período inválido. Use "weekly" ou "monthly".', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async reportPorTipo(
    @Query('period') period: string = 'weekly',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (period !== 'weekly' && period !== 'monthly') {
      throw new BadRequestException('Período inválido. Use "weekly" ou "monthly".');
    }
    return this.vendasService.getVendasPorTipo(period as 'weekly' | 'monthly', month, year);
  }


  @Get('report/vendas-pagas')
  @ApiOperation({ summary: 'Relatório de vendas pagas', description: 'Retorna relatório de vendas que já foram pagas.' })
  @ApiResponse({ status: 200, description: 'Relatório de vendas pagas retornado com sucesso.', schema: { example: [{ id: 1, valorTotal: 100.0, statusPagamento: 'pago' }] } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Período inválido. Use "weekly" ou "monthly".', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async getVendasPagas(
    @Query('period') period: string = 'weekly',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (period !== 'weekly' && period !== 'monthly') {
      throw new BadRequestException('Período inválido. Use "weekly" ou "monthly".');
    }
    return this.vendasService.getVendasPagas(period as 'weekly' | 'monthly', month, year);
  }


  @Get('report/por-bairro')
  @ApiOperation({ summary: 'Relatório de vendas por bairro', description: 'Retorna relatório de vendas agrupado por bairro.' })
  @ApiQuery({
    name: 'period',
    required: true,
    type: String,
    description: 'Período do relatório (weekly ou monthly)',
    example: 'monthly'
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Mês (ex: Jan, Fev, Mar, ...). Obrigatório se period=monthly.',
    example: 'Jan'
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Ano (ex: 2025). Obrigatório se period=monthly.',
    example: '2025'
  })
  @ApiResponse({ status: 200, description: 'Relatório por bairro retornado com sucesso.', schema: { example: [{ bairro: 'Centro', vendas: 5, valorTotal: 500.0 }] } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Período inválido. Use "weekly" ou "monthly".', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async getVendasPorBairro(
    @Query('period') period: string = 'weekly',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (period !== 'weekly' && period !== 'monthly') {
      throw new BadRequestException('Período inválido. Use "weekly" ou "monthly".');
    }
    return this.vendasService.getVendasPorBairro(period as 'weekly' | 'monthly', month, year);
  }


  @Get('report/vendas-pendentes')
  @ApiOperation({ summary: 'Relatório de vendas pendentes', description: 'Retorna relatório de vendas que ainda não foram pagas.' })
  @ApiQuery({
    name: 'period',
    required: true,
    type: String,
    description: 'Período do relatório (weekly ou monthly)',
    example: 'monthly'
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Mês (ex: Jan, Fev, Mar, ...). Obrigatório se period=monthly.',
    example: 'Jan'
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Ano (ex: 2025). Obrigatório se period=monthly.',
    example: '2025'
  })
  @ApiResponse({ status: 200, description: 'Relatório de vendas pendentes retornado com sucesso.', schema: { example: [{ id: 2, valorTotal: 50.0, statusPagamento: 'pendente' }] } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Período inválido. Use "weekly" ou "monthly".', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  async getVendasPendentes(
    @Query('period') period: string = 'weekly',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (period !== 'weekly' && period !== 'monthly') {
      throw new BadRequestException('Período inválido. Use "weekly" ou "monthly".');
    }
    return this.vendasService.getVendasPendentes(period as 'weekly' | 'monthly', month, year);
  }

 
}
