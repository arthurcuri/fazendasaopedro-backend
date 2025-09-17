import {Entity,PrimaryGeneratedColumn,Column,OneToMany,CreateDateColumn,UpdateDateColumn} from 'typeorm';
import { ItemVenda } from 'src/vendas/item-venda/entities/item-venda.entity';


export enum TipoProduto {
  OVOS  = 'ovos',
  MEL   = 'mel',
  DUZIA = 'duzia',
  PENTE = 'pente',
  OUTRO = 'outro',
}

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn({ name: 'id_produto' })
  id: number;

  @Column({ name: 'nome_produto', length: 255 })
  nomeProduto: string;

  @Column({ name: 'tipo_produto', type: 'enum', enum: TipoProduto })
  tipoProduto: TipoProduto;

  @Column({ name: 'preco', type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ItemVenda, item => item.produto)
  itensVenda: ItemVenda[];

  
}