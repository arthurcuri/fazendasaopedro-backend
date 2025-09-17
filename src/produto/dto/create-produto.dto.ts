// src/produtos/dto/create-produto.dto.ts
import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoProduto } from '../entities/produto.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Ovo Branco' })
  @IsString()
  nomeProduto: string;

  @ApiProperty({ example: 'outro' })
  @IsEnum(TipoProduto)
  tipoProduto?: TipoProduto;

  @ApiProperty({ example: 12.50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco?: number;

    



  








  //@Type(() => Number)
  //@IsInt()
  //@Min(0)
  //estoque: number;
}
