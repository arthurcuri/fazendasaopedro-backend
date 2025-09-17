import { UnidadeItemVenda } from '../entities/item-venda.entity';
import { IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateItemVendaDto } from './create-item-venda.dto';

export class UpdateItemVendaDto extends PartialType(CreateItemVendaDto) {
  @IsEnum(UnidadeItemVenda)
  unidade?: UnidadeItemVenda;
}
