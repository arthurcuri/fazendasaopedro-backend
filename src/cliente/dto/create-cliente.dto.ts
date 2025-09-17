import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusCliente, DiaSemana} from '../entities/cliente.entity';
import { ApiProperty } from '@nestjs/swagger';



export class CreateClienteDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  nome: string;
  
  @ApiProperty({ example: 'segunda' })
  @IsOptional()
  @IsEnum(DiaSemana)
  dia_semana?: DiaSemana;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  endereco?: string;
   
  @ApiProperty({ example: 'Centro' })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiProperty({ example: 'semanal' })
  @IsOptional()
  @IsEnum(StatusCliente)
  status?: StatusCliente;

  @ApiProperty({ example: 'Cliente importante' })
  @IsOptional()
  @IsString()
  observacoes?: string;
  

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dezenas_padrao?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pentes_padrao?: number;

 
}