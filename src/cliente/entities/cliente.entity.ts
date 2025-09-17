import {Entity,PrimaryGeneratedColumn,Column,OneToMany} from 'typeorm';
import { Venda } from 'src/vendas/entities/venda.entity';


export enum StatusCliente {
  SEMANAL = 'semanal',
  POTENCIAL = 'potencial',
  QUINZENAL = 'quinzenal',
  CHAMAR = 'chamar',
  ESPORADICO = 'esporadico',
  VIAJANDO = 'viajando',
  DEFINA_STATUS_DO_CLIENTE = 'defina status do cliente',
}

export enum DiaSemana {
  VARIAVEL = 'variavel',
  SEGUNDA = 'segunda',
  TERCA = 'terça',
  QUARTA = 'quarta',
  QUINTA = 'quinta',
  SEXTA = 'sexta',
  SABADO = 'sábado',
  DOMINGO = 'domingo',
}

export enum StatusPagamento {
  PAGO = 'pago',
  PENDENTE = 'Pendente',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  @Column({ name: 'nome', length: 255 })
  nome: string;

  @Column({
    name: 'dia_semana',
    type: 'enum',
    enum: DiaSemana,
    default: DiaSemana.VARIAVEL,
  })
  dia_semana: DiaSemana;

  @Column({ name: 'endereco', type: 'text' })
  endereco: string;

  @Column({ name: 'bairro', length: 100 })
  bairro: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StatusCliente,
    default: StatusCliente.DEFINA_STATUS_DO_CLIENTE,
  })
  status: StatusCliente;

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes?: string;
  @OneToMany(() => Venda, venda => venda.cliente)
  vendas: Venda[];

  @Column({ name: 'dezenas_padrao', type: 'int', nullable: true })
  dezenas_padrao?: number;

  @Column({ name: 'pentes_padrao', type: 'int', nullable: true })
  pentes_padrao?: number;

}
