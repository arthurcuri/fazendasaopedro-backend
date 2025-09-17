
import { IsEmail, IsOptional, IsString,MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Maria Silva', description: 'Nome do usuário' })
  nome?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'maria@email.com', description: 'Email do usuário' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'senhaSegura123', description: 'Senha do usuário' })
  senha?: string;
  }
  