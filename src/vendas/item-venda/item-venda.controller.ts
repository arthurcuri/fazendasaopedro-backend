import {Controller,Post,Get,Param,Body,Delete,ParseIntPipe} from '@nestjs/common';
import { ItemVendaService } from './item-venda.service';
import { CreateItemVendaDto } from './dto/create-item-venda.dto';
import { ItemVenda } from './entities/item-venda.entity';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('itens-venda')
@Controller('itens-venda')
export class ItemVendaController {
  constructor(private readonly itemVendaService: ItemVendaService) {}


  @Post()
  @ApiOperation({ summary: 'Cria um novo item de venda' })
  @ApiBody({ type: CreateItemVendaDto })
  @ApiResponse({ status: 201, description: 'Item de venda criado com sucesso.' })
  create(@Body() dto: CreateItemVendaDto): Promise<ItemVenda> {
    return this.itemVendaService.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Lista todos os itens de venda' })
  @ApiResponse({ status: 200, description: 'Lista de itens de venda.' })
  findAll(): Promise<ItemVenda[]> {
    return this.itemVendaService.findAll();
  }


  @Get(':id')
  @ApiOperation({ summary: 'Busca um item de venda por ID' })
  @ApiResponse({ status: 200, description: 'Item de venda encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ItemVenda> {
    return this.itemVendaService.findOne(id);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Remove um item de venda' })
  @ApiResponse({ status: 200, description: 'Item de venda removido.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemVendaService.remove(id);
  }
}
