import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,OneToMany,JoinColumn} from 'typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ItemVenda } from 'src/vendas/item-venda/entities/item-venda.entity';
import { Produto } from 'src/produto/entities/produto.entity';

export enum StatusPagamento {
  PAGO = 'pago',
  PENDENTE = 'pendente',
  PARCIAL = 'parcial',
}

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn({ name: 'id_venda' })
  id: number;

 
  @ManyToOne(() => Cliente, cliente => cliente.vendas, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

@ManyToOne(() => Produto, { eager: true })
@JoinColumn({ name: 'id_produto' })
produto: Produto;



  @Column({ name: 'data_venda', type: 'date' })
  dataVenda: Date;

  
  @Column({ name: 'total_duzias', type: 'int',default: 0 })
  totalDuzias: number;

  
  @Column({ name: 'total_caixas', type: 'int',default: 0 })
  totalCaixas: number;


  @Column({ name: 'valor_total', type: 'decimal', precision: 12, scale: 2 })
  valorTotal: number;


  
  @Column({
    name: 'status_pagamento',
    type: 'enum',
    enum: StatusPagamento,
    default: StatusPagamento.PENDENTE,
  })
  statusPagamento: StatusPagamento;

   @Column({ 
    name: 'data_pagamento', 
    type: 'date', 
    nullable: true 
  })
  dataPagamento?: Date;

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes?: string;

  
  @OneToMany(() => ItemVenda, item => item.venda, { cascade: true, eager: true })
  itens: ItemVenda[];

 
}


