export enum UnidadeItemVenda {
  UNIDADE = 'unidade',
  DUZIA = 'Dúzia',
  PENTE = 'Pente',
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Venda } from 'src/vendas/entities/venda.entity';
import { Produto } from 'src/produto/entities/produto.entity';

@Entity('itens_venda')
export class ItemVenda {
  @PrimaryGeneratedColumn({ name: 'id_item_venda' })
  id: number;

  // 📌 Relacionamento com a venda
  @ManyToOne(() => Venda, venda => venda.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venda' })
  venda: Venda;

  // 📌 Relacionamento com produto
  @ManyToOne(() => Produto, produto => produto.itensVenda, {
    eager: true, // carrega o produto automaticamente com os itens
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_produto' })
  produto: Produto;

  // 🧮 Quantidade vendida do produto
  @Column({ name: 'quantidade', type: 'int' })
  quantidade: number;

  // Grandeza/unidade do item (unidade, duzia, pente)
  @Column({ name: 'unidade', 
  type: 'enum',
  enum: UnidadeItemVenda,
  default: UnidadeItemVenda.UNIDADE
  })
  unidade: UnidadeItemVenda;

  // 💲 Preço unitário
  @Column({ name: 'preco_unitario', type: 'decimal', precision: 10, scale: 2 })
  precoUnitario: number;

  // 💰 Preço total do item (quantidade * preço unitário)
  @Column({ name: 'preco_total', type: 'decimal', precision: 12, scale: 2 })
  precoTotal: number;
}
