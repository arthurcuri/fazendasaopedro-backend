// src/vendas/item-venda/item-venda.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemVendaService } from './item-venda.service';
import { ItemVendaController } from './item-venda.controller';
import { ItemVenda } from './entities/item-venda.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([ItemVenda]) ],
  controllers: [ItemVendaController],
  providers: [ItemVendaService],
})
export class ItemVendaModule {}
