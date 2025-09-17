

import { PartialType } from '@nestjs/swagger';
import { CreateVendaDto } from './create-venda.dto';
import { Type } from 'class-transformer';
import { IsOptional,ValidateNested } from 'class-validator';
import { CreateItemVendaDto } from 'src/vendas/item-venda/dto/create-item-venda.dto';

export class UpdateVendaDto extends PartialType(CreateVendaDto) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens: CreateItemVendaDto[];
}
