import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { Venda } from 'src/vendas/entities/venda.entity';
import { User } from 'src/user/entities/user.entity';
import { ItemVenda } from 'src/vendas/item-venda/entities/item-venda.entity';



export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Cliente, Produto,Venda,User,ItemVenda],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: true,
});
