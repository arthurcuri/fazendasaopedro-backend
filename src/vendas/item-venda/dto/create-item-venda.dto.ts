import { UnidadeItemVenda } from '../entities/item-venda.entity';
import { IsEnum } from 'class-validator';
import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemVendaDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  @Type(() => Number)
  @IsInt()
  id_produto: number;

  @ApiProperty({ example: 5, description: 'Quantidade do item' })
  @Type(() => Number)
  @IsInt()
  quantidade: number;

  @ApiProperty({ example: 'Pente', description: 'Unidade do item (ex: Pente, Duzia, etc)' })
  @IsEnum(UnidadeItemVenda)
  unidade: UnidadeItemVenda;

  @ApiProperty({ example: 12.5, description: 'Preço unitário (opcional)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  preco_unitario?: number;
}
