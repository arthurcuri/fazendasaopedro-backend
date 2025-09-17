import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Venda, StatusPagamento} from './entities/venda.entity';
import { CreateVendaDto } from './dto/create-venda.dto';
import { Cliente, StatusCliente } from 'src/cliente/entities/cliente.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { ItemVenda } from './item-venda/entities/item-venda.entity';
import * as moment from 'moment-timezone';
import { UnidadeItemVenda } from './item-venda/entities/item-venda.entity';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepo: Repository<Venda>,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,

    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,

    @InjectRepository(ItemVenda)
    private readonly itemVendaRepo: Repository<ItemVenda>,
  ) {}

  async create(createVendaDto: CreateVendaDto): Promise<Venda> {
    console.log('DTO recebido:', createVendaDto);
    const cliente = await this.clienteRepo.findOne({
      where: { id: createVendaDto.id_cliente },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

   
    const dataVenda = moment.tz(createVendaDto.dataVenda, 'America/Sao_Paulo').startOf('day').toDate();
    const dataVendaFim = moment.tz(createVendaDto.dataVenda, 'America/Sao_Paulo').endOf('day').toDate();
    
    const vendasExistentes = await this.vendaRepo.find({
      where: {
        cliente: { id: createVendaDto.id_cliente },
        dataVenda: Between(dataVenda, dataVendaFim),
      },
      relations: ['itens', 'itens.produto'],
    });

    const itens = await Promise.all(
      createVendaDto.itens.map(async (itemDto, idx) => {
        const produto = await this.produtoRepo.findOne({
          where: { id: itemDto.id_produto },
        });

        if (!produto) {
          throw new NotFoundException(`Produto com ID ${itemDto.id_produto} não encontrado`);
        }

       
        console.log(`[Item ${idx}] unidade recebida:`, itemDto.unidade);

      
        let unidade: UnidadeItemVenda = UnidadeItemVenda.UNIDADE;
        if (itemDto.unidade === 'Dúzia') unidade = UnidadeItemVenda.DUZIA;
        else if (itemDto.unidade === 'Pente') unidade = UnidadeItemVenda.PENTE;
        else if (itemDto.unidade === 'unidade') unidade = UnidadeItemVenda.UNIDADE;

        const item = this.itemVendaRepo.create({
          quantidade: itemDto.quantidade,
          unidade,
          precoUnitario: itemDto.preco_unitario,
          precoTotal: itemDto.quantidade * (itemDto.preco_unitario ?? 0),
          produto,
        });

      
        console.log(`[Item ${idx}] item criado:`, item);

        return item;
      }),
    );

    
    for (const vendaExistente of vendasExistentes) {
      const itensDaNovaVenda = itens
        .map(item => ({
          id_produto: item.produto.id,
          quantidade: item.quantidade,
        }))
        .sort((a, b) => a.id_produto - b.id_produto);

      const itensDaVendaExistente = vendaExistente.itens
        .map(item => ({
          id_produto: item.produto.id,
          quantidade: item.quantidade,
        }))
        .sort((a, b) => a.id_produto - b.id_produto);

     
      const saoIdenticos = itensDaNovaVenda.length === itensDaVendaExistente.length &&
        itensDaNovaVenda.every((novoItem, index) => {
          const itemExistente = itensDaVendaExistente[index];
          return novoItem.id_produto === itemExistente.id_produto &&
                 novoItem.quantidade === itemExistente.quantidade;
        });

      if (saoIdenticos) {
        throw new Error(`Já existe uma venda para este cliente na data ${moment(createVendaDto.dataVenda).format('DD/MM/YYYY')} com os mesmos produtos e quantidades.`);
      }
    }

    const novaVenda = this.vendaRepo.create({
      cliente,
      dataVenda: createVendaDto.dataVenda,
      totalDuzias: createVendaDto.totalDuzias,
      totalCaixas: createVendaDto.totalCaixas,
      valorTotal: createVendaDto.valorTotal,
      statusPagamento: createVendaDto.statusPagamento,
      observacoes: createVendaDto.observacoes,
      itens,
      dataPagamento: createVendaDto.dataPagamento, 
    });

    return await this.vendaRepo.save(novaVenda);
  }

  async findAll(): Promise<Venda[]> {
    return this.vendaRepo.find({
      relations: ['cliente', 'itens', 'itens.produto'],
      order: { dataVenda: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Venda> {
    const venda = await this.vendaRepo.findOne({
      where: { id },
      relations: ['cliente', 'itens', 'itens.produto'],
    });

    if (!venda) {
      throw new NotFoundException('Venda não encontrada');
    }

    return venda;
  }

  async remove(id: number): Promise<void> {
    const venda = await this.findOne(id);
    await this.vendaRepo.remove(venda);
  }

  async update(id: number, body: any): Promise<Venda> {
    const venda = await this.vendaRepo.findOne({
      where: { id },
      relations: ['cliente', 'itens', 'itens.produto'],
    });

  
    if (body.unidade) {
      console.log(`[UPDATE] unidade recebida no body:`, body.unidade);
    } else if (body.itens && body.itens[0] && body.itens[0].unidade) {
      console.log(`[UPDATE] unidade recebida em itens[0]:`, body.itens[0].unidade);
    } else {
      console.log(`[UPDATE] Nenhuma unidade recebida no update.`);
    }

    if (!venda) {
      throw new NotFoundException('Venda não encontrada');
    }

    venda.dataVenda = body.dataVenda;
    venda.valorTotal = body.valorTotal;
    venda.totalDuzias = body.totalDuzias;
    venda.totalCaixas = body.totalCaixas;
    venda.statusPagamento = body.statusPagamento;
    venda.dataPagamento = body.dataPagamento ? moment.tz(body.dataPagamento, 'America/Sao_Paulo').toDate() : undefined;
    venda.observacoes = body.observacoes;


    if (body.itens && Array.isArray(body.itens) && venda.itens && venda.itens.length > 0) {
      body.itens.forEach((itemDto, idx) => {
        if (!venda.itens[idx]) {
          console.log(`[DEBUG] Não existe venda.itens[${idx}] para atualizar.`);
          return;
        }
        console.log(`[DEBUG] Atualizando venda.itens[${idx}]:`, {
          antes: { unidade: venda.itens[idx].unidade, quantidade: venda.itens[idx].quantidade, precoUnitario: venda.itens[idx].precoUnitario, precoTotal: venda.itens[idx].precoTotal },
          recebido: itemDto
        });
      
        if (itemDto.unidade !== undefined) {
          let unidade: UnidadeItemVenda = UnidadeItemVenda.UNIDADE;
          if (itemDto.unidade === 'Dúzia') unidade = UnidadeItemVenda.DUZIA;
          else if (itemDto.unidade === 'Pente') unidade = UnidadeItemVenda.PENTE;
          else if (itemDto.unidade === 'unidade') unidade = UnidadeItemVenda.UNIDADE;
          console.log(`[DEBUG] Atualizando unidade de venda.itens[${idx}] de '${venda.itens[idx].unidade}' para '${unidade}'`);
          venda.itens[idx].unidade = unidade;
        }
        if (itemDto.quantidade !== undefined) {
          venda.itens[idx].quantidade = itemDto.quantidade;
        }
        if (itemDto.preco_unitario !== undefined) {
          venda.itens[idx].precoUnitario = itemDto.preco_unitario;
        }
        if (itemDto.preco_total !== undefined) {
          venda.itens[idx].precoTotal = itemDto.preco_total;
        }
        console.log(`[DEBUG] Depois do update venda.itens[${idx}]:`, {
          unidade: venda.itens[idx].unidade, quantidade: venda.itens[idx].quantidade, precoUnitario: venda.itens[idx].precoUnitario, precoTotal: venda.itens[idx].precoTotal
        });
      });
    } else if (body.unidade && venda.itens && venda.itens.length > 0) {
      
      venda.itens.forEach((item, idx) => {
        console.log(`[DEBUG] Atualizando unidade de venda.itens[${idx}] de '${item.unidade}' para '${body.unidade}'`);
        item.unidade = body.unidade;
      });
    }

    if (body.cliente) {
      venda.cliente.nome = body.cliente.nome;
      venda.cliente.endereco = body.cliente.endereco;
      venda.cliente.bairro = body.cliente.bairro;
      venda.cliente.dia_semana = body.cliente.dia_semana;
      venda.cliente.status = body.cliente.status;
      await this.clienteRepo.save(venda.cliente);
    }

    if (body.itens && Array.isArray(body.itens) && venda.itens && venda.itens.length > 0) {
      body.itens.forEach((itemDto, idx) => {
        if (itemDto.unidade && venda.itens[idx]) {
          let unidade: UnidadeItemVenda = UnidadeItemVenda.UNIDADE;
          if (itemDto.unidade === 'Dúzia') unidade = UnidadeItemVenda.DUZIA;
          else if (itemDto.unidade === 'Pente') unidade = UnidadeItemVenda.PENTE;
          else if (itemDto.unidade === 'unidade') unidade = UnidadeItemVenda.UNIDADE;
          venda.itens[idx].unidade = unidade;
          console.log(`[UPDATE] unidade salva em venda.itens[${idx}] (via itens[${idx}]):`, unidade);
        }
     
      });
    }

    return this.vendaRepo.save(venda);
  }

  async getFaturamentoTotal(): Promise<number> {
    const result = await this.vendaRepo
      .createQueryBuilder('venda')
      .select('SUM(venda.valorTotal)', 'total')
      .getRawOne();

    return Number(result.total) || 0;
  }

  async criarSemana(startDate?: string): Promise<{ message: string; total: number; debug: any[] }> {
    const base = startDate
      ? moment.tz(startDate, 'YYYY-MM-DD', 'America/Sao_Paulo')
      : moment().tz('America/Sao_Paulo');
    const proximaSemanaInicio = base.clone().add(1, 'week').startOf('isoWeek');
    const proximaSemanaFim = base.clone().add(1, 'week').endOf('isoWeek');
    const diaMap = { segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6, domingo: 7 };


    const clientes = await this.clienteRepo.find();

   
    const vendasHistorico = await this.vendaRepo.createQueryBuilder('venda')
      .leftJoinAndSelect('venda.cliente', 'cliente')
      .leftJoinAndSelect('venda.itens', 'itens')
      .leftJoinAndSelect('itens.produto', 'produto')
      .getMany();


    const vendasPorCliente: Record<number, Venda[]> = {};
    for (const venda of vendasHistorico) {
      if (venda.cliente && venda.cliente.id) {
        if (!vendasPorCliente[venda.cliente.id]) vendasPorCliente[venda.cliente.id] = [];
        vendasPorCliente[venda.cliente.id].push(venda);
      }
    }

  const vendasParaCriar: Venda[] = [];

  const debugInfo: any[] = [];

    for (const c of clientes) {
      const d = c.dia_semana?.toLowerCase();
      if (!d || !diaMap[d]) continue;
      const vendasCliente = vendasPorCliente[c.id] || [];
      if (vendasCliente.length === 0) continue;

      let dataVenda: Date | null = null;
      let devecriar = false;

      if ([StatusCliente.SEMANAL, StatusCliente.CHAMAR].includes(c.status)) {
        dataVenda = proximaSemanaInicio.clone().isoWeekday(diaMap[d]).toDate();
        devecriar = true;
      } else {
        continue;
      }

      if (!devecriar || !dataVenda) continue;

      const isChamar = c.status === StatusCliente.CHAMAR;

      let vendaBase: Venda | undefined;
      if (c.status === StatusCliente.SEMANAL) {
      
        const vendasOrdenadas = [...vendasCliente].sort((a, b) => {
          const dataA = new Date(a.dataVenda).getTime();
          const dataB = new Date(b.dataVenda).getTime();
          return dataA - dataB;
        });
   
        vendaBase = vendasOrdenadas.length > 0 ? vendasOrdenadas[0] : undefined;
        debugInfo.push({
          clienteId: c.id,
          clienteNome: c.nome,
          vendasOrdenadas: vendasOrdenadas.map(v => v.dataVenda),
          vendaBase: vendaBase?.dataVenda || null,
          log: 'Pegando a PRIMEIRA venda registrada para cliente SEMANAL'
        });
      } else {
      
        vendaBase = vendasCliente.length > 0 ? vendasCliente[vendasCliente.length - 1] : undefined;
      }

      if (!vendaBase) {
        debugInfo.push({
          clienteId: c.id,
          clienteNome: c.nome,
          log: 'Nenhuma venda base encontrada para este cliente, pulando.'
        });
        continue;
      }


      const novosItens = vendaBase.itens.map(item => {
        const quantidade = isChamar ? 0 : item.quantidade;
        const precoUnitario = isChamar ? 0 : item.precoUnitario;
        const precoTotal = isChamar ? 0 : item.precoTotal;
        return this.itemVendaRepo.create({
          produto: item.produto,
          quantidade,
          precoUnitario,
          precoTotal,
          unidade: item.unidade,
        });
      });

      const totalDuzias = isChamar ? 0 : vendaBase.totalDuzias;
      const totalCaixas = isChamar ? 0 : vendaBase.totalCaixas;
      const valorTotal = isChamar ? 0 : vendaBase.valorTotal;

      const novaVenda = this.vendaRepo.create({
        cliente: c,
        dataVenda,
        totalDuzias,
        totalCaixas,
        valorTotal,
        statusPagamento: StatusPagamento.PENDENTE,
        observacoes: vendaBase.observacoes || '',
        itens: novosItens,
      });
      vendasParaCriar.push(novaVenda);
    }

    
    const todasPromessasItens = vendasParaCriar.flatMap(venda => venda.itens.map(item => this.itemVendaRepo.save(item)));
    await Promise.all(todasPromessasItens);


    await Promise.all(vendasParaCriar.map(venda => this.vendaRepo.save(venda)));

    return {
      message: `${vendasParaCriar.length} vendas criadas para a semana de ${proximaSemanaInicio.format('DD/MM')} a ${proximaSemanaFim.format('DD/MM')}`,
      total: vendasParaCriar.length,
      debug: debugInfo,
    };
  }


  async getVendasPorMesHistorico() {
  
  const vendasPorMesAno = await this.vendaRepo
    .createQueryBuilder('venda')
    .select('MONTH(venda.dataVenda)', 'mes')
    .addSelect('YEAR(venda.dataVenda)', 'ano')
    .addSelect('COUNT(venda.id)', 'quantidade')
    .addSelect(`SUM(CASE WHEN venda.statusPagamento = 'pago' THEN venda.valorTotal ELSE 0 END)`, 'faturamento_pago')
    .addSelect(`SUM(CASE WHEN venda.statusPagamento = 'pendente' OR venda.statusPagamento = 'parcial' THEN venda.valorTotal ELSE 0 END)`, 'a_receber')
    .groupBy('ano')
    .addGroupBy('mes')
    .orderBy('ano', 'ASC')
    .addOrderBy('mes', 'ASC')
    .getRawMany();

  const nomesMeses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return vendasPorMesAno.map((item) => ({
    label: `${nomesMeses[Number(item.mes)]}/${item.ano}`,
    sales: Number(item.quantidade),
    revenue: Number(item.faturamento_pago) + Number(item.a_receber),
    pago: Number(item.faturamento_pago),
    aReceber: Number(item.a_receber),
  }));
}

  async getDashboardReport(period: 'weekly' | 'monthly', month?: string, year?: string) {

    const agora = moment().tz('America/Sao_Paulo');
    let startDate: Date;
    let endDate: Date;
    let labelMes: string | null = null;
    if (period === 'weekly') {
      startDate = agora.clone().startOf('isoWeek').toDate();
      endDate = agora.clone().endOf('isoWeek').toDate();
    } else if (month && year) {
      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const mesIndex = meses.findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (mesIndex === -1) throw new Error('Mês inválido');
      startDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').startOf('month').toDate();
      endDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').endOf('month').toDate();
      labelMes = `${meses[mesIndex]}/${year}`;
    } else {
      startDate = agora.clone().startOf('month').toDate();
      endDate = agora.clone().endOf('month').toDate();
    }

    
    const vendasNoPeriodo = await this.vendaRepo.find({
      where: { dataVenda: Between(startDate, endDate) },
      relations: ['cliente', 'itens', 'itens.produto'],
    });

    
    const totalVendas = vendasNoPeriodo.length;
    const faturamento = vendasNoPeriodo
      .filter(v => v.statusPagamento === StatusPagamento.PAGO)
      .reduce((sum, v) => sum + Number(v.valorTotal), 0);
    const aReceber = vendasNoPeriodo
      .filter(v => v.statusPagamento === StatusPagamento.PENDENTE || v.statusPagamento === StatusPagamento.PARCIAL)
      .reduce((sum, v) => sum + Number(v.valorTotal), 0);

    
    const vendasPorCliente: Record<number, Venda[]> = {};
    for (const venda of vendasNoPeriodo) {
      if (!vendasPorCliente[venda.cliente.id]) vendasPorCliente[venda.cliente.id] = [];
      vendasPorCliente[venda.cliente.id].push(venda);
    }

    let somaMedias = 0;
    let clientesComOvos = 0;

    for (const vendasCliente of Object.values(vendasPorCliente)) {
      let ovosVendidos = 0;
      for (const venda of vendasCliente) {
        for (const item of venda.itens) {
          const tipo = (item.produto?.tipoProduto || '').toLowerCase();
          if (tipo === 'ovos') {
            ovosVendidos += item.quantidade;
          } else if (tipo === 'duzia') {
            ovosVendidos += item.quantidade * 12;
          } else if (tipo === 'pente') {
            ovosVendidos += item.quantidade * 30;
          }
        }
      }
      if (vendasCliente.length > 0) {
        somaMedias += ovosVendidos / vendasCliente.length;
        clientesComOvos++;
      }
    }

    const mediaOvosPorCliente = clientesComOvos > 0 ? somaMedias / clientesComOvos : 0;

   
    const clientesNovos = await this.clienteRepo
      .createQueryBuilder('cliente')
      .leftJoin('cliente.vendas', 'venda')
      .where('venda.dataVenda BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('cliente.id')
      .getCount();

    
    let vendasPorDiaOuMes: { label: string; sales: number; revenue: number }[] = [];
    if (period === 'weekly') {
      const vendasPorDia = await this.vendaRepo
        .createQueryBuilder('venda')
        .select('DAYNAME(venda.dataVenda)', 'dia')
        .addSelect('COUNT(venda.id)', 'quantidade')
        .addSelect('SUM(venda.valorTotal)', 'faturamento')
        .where('venda.dataVenda BETWEEN :start AND :end', { start: startDate, end: endDate })
        .groupBy('dia')
        .getRawMany();

      const diasSemana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const traducoes: Record<string, string> = {
        Monday: 'Seg',
        Tuesday: 'Ter',
        Wednesday: 'Qua',
        Thursday: 'Qui',
        Friday: 'Sex',
        Saturday: 'Sáb',
        Sunday: 'Dom',
      };

      vendasPorDiaOuMes = diasSemana.map((diaIngles) => {
        const diaData = vendasPorDia.find((d) => d.dia === diaIngles);
        return {
          label: traducoes[diaIngles],
          sales: diaData ? Number(diaData.quantidade) : 0,
          revenue: diaData ? Number(diaData.faturamento) : 0,
        };
      });
    } else if (labelMes) {
      
      vendasPorDiaOuMes = [
        {
          label: labelMes,
          sales: totalVendas,
          revenue: faturamento,
        },
      ];
    }

    const topClientes = await this.vendaRepo
      .createQueryBuilder('venda')
      .select('cliente.nome', 'nome')
      .addSelect('COUNT(venda.id)', 'compras')
      .addSelect('AVG(venda.totalDuzias)', 'media_ovos')
      .addSelect('MAX(venda.dataVenda)', 'ultimoPedido')
      .innerJoin('venda.cliente', 'cliente')
      .where('venda.dataVenda BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('cliente.id')
      .orderBy('compras', 'DESC')
      .limit(5)
      .getRawMany();

    const clientesDestaque = topClientes.map((cliente) => ({
      nome: cliente.nome,
      compras: Number(cliente.compras),
      media_ovos: Number(cliente.media_ovos),
      ultimoPedido: moment(cliente.ultimoPedido).format('DD/MM/YYYY'),
    }));

    return {
      totalVendas,
      faturamento,
      aReceber,
      clientesNovos,
      mediaOvosPorCliente: Number(mediaOvosPorCliente.toFixed(2)),
      vendasPorDiaOuMes,
      clientesDestaque,
    };

  }

  async getVendasPorTipo(period: 'weekly' | 'monthly', month?: string, year?: string) {
    const agora = moment().tz('America/Sao_Paulo');
    let startDate: Date;
    let endDate: Date;
    if (period === 'weekly') {
      startDate = agora.clone().startOf('isoWeek').toDate();
      endDate = agora.clone().endOf('isoWeek').toDate();
    } else if (month && year) {
      const mesIndex = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (mesIndex === -1) throw new Error('Mês inválido');
      startDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').startOf('month').toDate();
      endDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').endOf('month').toDate();
    } else {
      startDate = agora.clone().startOf('month').toDate();
      endDate = agora.clone().endOf('month').toDate();
    }

    console.log(` Analise vendas por tipo no período: ${moment(startDate).format('DD/MM/YYYY')} a ${moment(endDate).format('DD/MM/YYYY')}`);

    
    const vendas = await this.vendaRepo.find({
      where: {
        dataVenda: Between(startDate, endDate),
      },
      relations: ['itens', 'itens.produto'],
    });

    console.log(` Total de vendas encontradas: ${vendas.length}`);
    
   
    const vendasPagas = vendas.filter(v => v.statusPagamento === StatusPagamento.PAGO);
    const vendasNaoPagas = vendas.filter(v => v.statusPagamento !== StatusPagamento.PAGO);
    
    console.log(` Vendas PAGAS: ${vendasPagas.length} (faturamento realizado)`);
    console.log(` Vendas NÃO PAGAS: ${vendasNaoPagas.length} (valores a receber)`);

    
    const vendasPorTipo = {
      ovos: { 
        quantidade: 0, 
        totalVendas: 0, 
        totalDuzias: 0, 
        totalCaixas: 0,
        faturamento: 0,      
        produtos: new Set<string>()
      },
      mel: { 
        quantidade: 0, 
        totalVendas: 0,
        faturamento: 0,      
        produtos: new Set<string>()
      },
      outro: { 
        quantidade: 0, 
        totalVendas: 0,
        faturamento: 0,      
        produtos: new Set<string>()
      },
    };

    const vendasProcessadas = new Set();

    vendas.forEach((venda) => {
      console.log(`Processando venda ID ${venda.id} - Data: ${moment(venda.dataVenda).format('DD/MM/YYYY')} - Status: ${venda.statusPagamento} - Dúzias: ${venda.totalDuzias} - Caixas: ${venda.totalCaixas}`);
      
      venda.itens.forEach((item) => {
        const tipo = item.produto.tipoProduto;
        const isPago = venda.statusPagamento === StatusPagamento.PAGO;
        console.log(`   Item: ${item.produto.nomeProduto} (${tipo}) - Qtd: ${item.quantidade} - Preço Total: ${item.precoTotal} - Status: ${isPago ? 'PAGO' : 'PENDENTE'}`);
        
        if (tipo === 'ovos') {
          vendasPorTipo.ovos.quantidade += item.quantidade;
          if (isPago) {
            vendasPorTipo.ovos.faturamento += Number(item.precoTotal);
          }
          vendasPorTipo.ovos.produtos.add(item.produto.nomeProduto);
          if (!vendasProcessadas.has(`ovos-${venda.id}`)) {
            vendasPorTipo.ovos.totalVendas += 1;
            vendasPorTipo.ovos.totalDuzias += venda.totalDuzias;
            vendasPorTipo.ovos.totalCaixas += venda.totalCaixas;
            vendasProcessadas.add(`ovos-${venda.id}`);
            console.log(`     Venda de ovos contabilizada: +${venda.totalDuzias} dúzias, +${venda.totalCaixas} caixas - ${isPago ? 'PAGO' : 'PENDENTE'}`);
          }
        } else if (tipo === 'mel') {
          vendasPorTipo.mel.quantidade += item.quantidade;
          if (isPago) {
            vendasPorTipo.mel.faturamento += Number(item.precoTotal);
          }
          vendasPorTipo.mel.produtos.add(item.produto.nomeProduto);
          if (!vendasProcessadas.has(`mel-${venda.id}`)) {
            vendasPorTipo.mel.totalVendas += 1;
            vendasProcessadas.add(`mel-${venda.id}`);
            console.log(`     Venda de mel contabilizada - ${isPago ? 'PAGO' : 'PENDENTE'}`);
          }
        } else {
          vendasPorTipo.outro.quantidade += item.quantidade;
          if (isPago) {
            vendasPorTipo.outro.faturamento += Number(item.precoTotal);
          }
          vendasPorTipo.outro.produtos.add(item.produto.nomeProduto);
          if (!vendasProcessadas.has(`outro-${venda.id}`)) {
            vendasPorTipo.outro.totalVendas += 1;
            vendasProcessadas.add(`outro-${venda.id}`);
            console.log(`     Venda de outros contabilizada - ${isPago ? 'PAGO' : 'PENDENTE'}`);
          }
        }
      });
    });

    console.log(`RESULTADO FINAL:`);
    const totalOvos = (vendasPorTipo.ovos.totalDuzias * 12) + (vendasPorTipo.ovos.totalCaixas * 30);
    console.log(`   Ovos: ${totalOvos} unidades totais (${vendasPorTipo.ovos.totalDuzias} dúzias × 12 + ${vendasPorTipo.ovos.totalCaixas} pentes × 30), ${vendasPorTipo.ovos.totalVendas} vendas`);
    console.log(`     Faturamento pago: R$ ${vendasPorTipo.ovos.faturamento.toFixed(2)}`);
    console.log(`   Mel: ${vendasPorTipo.mel.quantidade} unidades, ${vendasPorTipo.mel.totalVendas} vendas`);
    console.log(`    Faturamento pago: R$ ${vendasPorTipo.mel.faturamento.toFixed(2)}`);
    console.log(`   Outros: ${vendasPorTipo.outro.quantidade} unidades, ${vendasPorTipo.outro.totalVendas} vendas`);
    console.log(`     Faturamento pago: R$ ${vendasPorTipo.outro.faturamento.toFixed(2)}`);

    return [
      { 
        tipo: 'Ovos', 
        quantidade: (vendasPorTipo.ovos.totalDuzias * 12) + (vendasPorTipo.ovos.totalCaixas * 30), 
        totalVendas: vendasPorTipo.ovos.totalVendas,
        totalDuzias: vendasPorTipo.ovos.totalDuzias,
        totalCaixas: vendasPorTipo.ovos.totalCaixas,
        faturamento: vendasPorTipo.ovos.faturamento,
        produtos: Array.from(vendasPorTipo.ovos.produtos)
      },
      { 
        tipo: 'Mel', 
        quantidade: vendasPorTipo.mel.quantidade,
        totalVendas: vendasPorTipo.mel.totalVendas,
        faturamento: vendasPorTipo.mel.faturamento,
        produtos: Array.from(vendasPorTipo.mel.produtos)
      },
      { 
        tipo: 'Outros', 
        quantidade: vendasPorTipo.outro.quantidade,
        totalVendas: vendasPorTipo.outro.totalVendas,
        faturamento: vendasPorTipo.outro.faturamento,
        produtos: Array.from(vendasPorTipo.outro.produtos)
      },
    ];
  }

  async getVendasPagas(period: 'weekly' | 'monthly', month?: string, year?: string) {
    const agora = moment().tz('America/Sao_Paulo');
    let startDate: Date;
    let endDate: Date;
    if (period === 'weekly') {
      startDate = agora.clone().startOf('isoWeek').toDate();
      endDate = agora.clone().endOf('isoWeek').toDate();
    } else if (month && year) {
      const mesIndex = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (mesIndex === -1) throw new Error('Mês inválido');
      startDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').startOf('month').toDate();
      endDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').endOf('month').toDate();
    } else {
      startDate = agora.clone().startOf('month').toDate();
      endDate = agora.clone().endOf('month').toDate();
    }

    console.log(` Buscando vendas pagas no período: ${moment(startDate).format('DD/MM/YYYY')} a ${moment(endDate).format('DD/MM/YYYY')}`);

    const vendasPagas = await this.vendaRepo.find({
      where: {
        dataVenda: Between(startDate, endDate),
        statusPagamento: StatusPagamento.PAGO,
      },
      relations: ['cliente', 'itens', 'itens.produto'],
      order: { dataPagamento: 'DESC' },
    });

    console.log(`Encontradas ${vendasPagas.length} vendas pagas no período`);

    return vendasPagas.map(venda => ({
      id: venda.id,
      valorTotal: Number(venda.valorTotal),
      dataPagamento: moment(venda.dataPagamento).format('DD/MM/YYYY'),
      dataVenda: moment(venda.dataVenda).format('DD/MM/YYYY'),
      cliente: venda.cliente.nome,
      produtos: venda.itens.map(item => ({
        nome: item.produto.nomeProduto,
        quantidade: item.quantidade,
        tipo: item.produto.tipoProduto,
        precoUnitario: Number(item.precoUnitario),
        precoTotal: Number(item.precoUnitario) * item.quantidade
      }))
    }));
  }

  async getVendasPendentes(period: 'weekly' | 'monthly', month?: string, year?: string) {
    const agora = moment().tz('America/Sao_Paulo');
    let startDate: Date;
    let endDate: Date;
    if (period === 'weekly') {
      startDate = agora.clone().startOf('isoWeek').toDate();
      endDate = agora.clone().endOf('isoWeek').toDate();
    } else if (month && year) {
      const mesIndex = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (mesIndex === -1) throw new Error('Mês inválido');
      startDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').startOf('month').toDate();
      endDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').endOf('month').toDate();
    } else {
      startDate = agora.clone().startOf('month').toDate();
      endDate = agora.clone().endOf('month').toDate();
    }

    console.log(` Buscando vendas pendentes no período: ${moment(startDate).format('DD/MM/YYYY')} a ${moment(endDate).format('DD/MM/YYYY')}`);

    const vendasPendentes = await this.vendaRepo.find({
      where: {
        dataVenda: Between(startDate, endDate),
        statusPagamento: In([StatusPagamento.PENDENTE, StatusPagamento.PARCIAL]),
      },
      relations: ['cliente', 'itens', 'itens.produto'],
      order: { dataVenda: 'DESC' },
    });

    console.log(` Encontradas ${vendasPendentes.length} vendas pendentes no período`);

    return vendasPendentes.map(venda => ({
      id: venda.id,
      valorTotal: Number(venda.valorTotal),
      valorDevido: Number(venda.valorTotal), 
      dataVenda: moment(venda.dataVenda).format('DD/MM/YYYY'),
      cliente: venda.cliente.nome,
      statusPagamento: venda.statusPagamento,
      produtos: venda.itens.map(item => ({
        nome: item.produto.nomeProduto,
        quantidade: item.quantidade,
        tipo: item.produto.tipoProduto,
        precoUnitario: Number(item.precoUnitario),
        precoTotal: Number(item.precoUnitario) * item.quantidade
      }))
    }));
  }

  async getVendasPorBairro(period: 'weekly' | 'monthly', month?: string, year?: string) {
    const agora = moment().tz('America/Sao_Paulo');
    let startDate: Date;
    let endDate: Date;
    if (period === 'weekly') {
      startDate = agora.clone().startOf('isoWeek').toDate();
      endDate = agora.clone().endOf('isoWeek').toDate();
    } else if (month && year) {
      const mesIndex = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (mesIndex === -1) throw new Error('Mês inválido');
      startDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').startOf('month').toDate();
      endDate = moment.tz({ year: parseInt(year), month: mesIndex, day: 1 }, 'America/Sao_Paulo').endOf('month').toDate();
    } else {
      startDate = agora.clone().startOf('month').toDate();
      endDate = agora.clone().endOf('month').toDate();
    }

    console.log(` Buscando vendas por bairro no período: ${moment(startDate).format('DD/MM/YYYY')} a ${moment(endDate).format('DD/MM/YYYY')}`);

    const vendasPorBairro = await this.vendaRepo
      .createQueryBuilder('venda')
      .select('cliente.bairro', 'bairro')
      .addSelect('COUNT(venda.id)', 'totalVendas')
      .addSelect('SUM(venda.valorTotal)', 'faturamento')
      .addSelect('COUNT(DISTINCT cliente.id)', 'totalClientes')
      .innerJoin('venda.cliente', 'cliente')
      .where('venda.dataVenda BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('cliente.bairro')
      .orderBy('faturamento', 'DESC')
      .getRawMany();

    console.log(` Encontrados ${vendasPorBairro.length} bairros com vendas no período`);

    return vendasPorBairro.map((item) => ({
      bairro: item.bairro || 'Não informado',
      totalVendas: Number(item.totalVendas),
      faturamento: Number(item.faturamento),
      totalClientes: Number(item.totalClientes),
      ticketMedio: Number(item.faturamento) / Number(item.totalVendas)
    }));
  }

}
