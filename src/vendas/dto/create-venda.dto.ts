import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, Min, IsEnum, ValidateNested, IsOptional, IsString } from 'class-validator';
import * as moment from 'moment-timezone';
import { StatusPagamento } from '../entities/venda.entity';
import { CreateItemVendaDto } from 'src/vendas/item-venda/dto/create-item-venda.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendaDto {
  @ApiProperty({ example: 881, description: 'ID do cliente relacionado à venda' })
  @IsInt()
  id_cliente: number;

  @ApiProperty({ example: 120, description: 'ID do produto vendido' })
  @IsOptional()
  @IsInt()
  id_produto: number;

  @ApiProperty({ example: '2025-08-22', description: 'Data da venda (YYYY-MM-DD ou DD/MM/YYYY)' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const formatosAceitos = ['DD/MM/YYYY', 'YYYY-MM-DD'];
      const data = moment.tz(value, formatosAceitos, 'America/Sao_Paulo');
      if (data.isValid()) {
        return data.toDate();
      }
      throw new Error(`Data inválida: ${value}. Use DD/MM/YYYY ou YYYY-MM-DD`);
    }
    if (value instanceof Date) {
      return value;
    }
    throw new Error(`Formato inválido para dataVenda`);
  })
  @IsDate()
  dataVenda?: Date;

  
  @IsOptional()
  @IsDate()
  dataPagamento?: Date; 

  @ApiProperty({ example: 10, description: 'Total de dúzias vendidas' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalDuzias?: number;

  @ApiProperty({ example: 2, description: 'Total de caixas vendidas' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCaixas?: number;

  @ApiProperty({ example: 120, description: 'Valor total da venda' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;

  @ApiProperty({ example: 'pendente', description: 'Status do pagamento' })
  @IsOptional()
  @IsEnum(StatusPagamento)
  statusPagamento?: StatusPagamento;

  @ApiProperty({ example: 'Observações da venda', description: 'Observações gerais' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({
    type: [CreateItemVendaDto],
    example: [
      { id_produto: 120, quantidade: 5, unidade: 'Dúzia', preco_unitario: 12.5 },
      { id_produto: 120, quantidade: 2, unidade: 'Dúzia', preco_unitario: 100 }
    ],
    description: 'Itens da venda'
  })
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens: CreateItemVendaDto[];
}
