import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './entities/venda.entity';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ProdutoModule } from 'src/produto/produto.module'; 
import { ItemVendaModule } from './item-venda/item-venda.module';
import { ItemVenda } from './item-venda/entities/item-venda.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Venda, Cliente, ItemVenda]), 
    ProdutoModule,
    ItemVendaModule,
  ],
  controllers: [VendasController],
  providers: [VendasService],
})
export class VendasModule {}
