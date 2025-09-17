import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateItensVenda1747074265269 implements MigrationInterface {
    name = 'CreateItensVenda1747074265269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP FOREIGN KEY \`FK_pagamentos_venda\``);
        await queryRunner.query(`ALTER TABLE \`vendas\` DROP FOREIGN KEY \`FK_74a281e471078adc518b54229fb\``);
        await queryRunner.query(`ALTER TABLE \`vendas\` DROP FOREIGN KEY \`FK_vendas_cliente\``);
        await queryRunner.query(`CREATE TABLE \`itens_venda\` (\`id_item_venda\` int NOT NULL AUTO_INCREMENT, \`quantidade\` int NOT NULL, \`preco_unitario\` decimal(10,2) NOT NULL, \`preco_total\` decimal(12,2) NOT NULL, \`vendaId\` int NULL, \`produtoId\` int NULL, PRIMARY KEY (\`id_item_venda\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`produtos\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`produtos\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`id_venda\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`id_cliente\``);
        await queryRunner.query(`ALTER TABLE \`vendas\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`vendas\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`vendaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`clienteId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`produtos\` CHANGE \`tipo_produto\` \`tipo_produto\` enum ('ovos', 'mel', 'outro') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` CHANGE \`valor_pago\` \`valor_pago\` decimal(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`valor_total\` \`valor_total\` decimal(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`lucro\` \`lucro\` decimal(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`id_cliente\` \`id_cliente\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`telefone\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`telefone\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`clientes\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`endereco\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`endereco\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetTokenExpiresAt\` \`resetTokenExpiresAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`itens_venda\` ADD CONSTRAINT \`FK_0cd8254f235ecebb82255e5c288\` FOREIGN KEY (\`vendaId\`) REFERENCES \`vendas\`(\`id_venda\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`itens_venda\` ADD CONSTRAINT \`FK_a6fe7221f1c0665517635d92dbd\` FOREIGN KEY (\`produtoId\`) REFERENCES \`produtos\`(\`id_produto\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD CONSTRAINT \`FK_52263db171b7b30389b0853bb90\` FOREIGN KEY (\`vendaId\`) REFERENCES \`vendas\`(\`id_venda\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD CONSTRAINT \`FK_bd0047bf9b0e55572a7f23b0e2a\` FOREIGN KEY (\`clienteId\`) REFERENCES \`clientes\`(\`id_cliente\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendas\` ADD CONSTRAINT \`FK_74a281e471078adc518b54229fb\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`clientes\`(\`id_cliente\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vendas\` DROP FOREIGN KEY \`FK_74a281e471078adc518b54229fb\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP FOREIGN KEY \`FK_bd0047bf9b0e55572a7f23b0e2a\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP FOREIGN KEY \`FK_52263db171b7b30389b0853bb90\``);
        await queryRunner.query(`ALTER TABLE \`itens_venda\` DROP FOREIGN KEY \`FK_a6fe7221f1c0665517635d92dbd\``);
        await queryRunner.query(`ALTER TABLE \`itens_venda\` DROP FOREIGN KEY \`FK_0cd8254f235ecebb82255e5c288\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetTokenExpiresAt\` \`resetTokenExpiresAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`endereco\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`endereco\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`clientes\` CHANGE \`email\` \`email\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`clientes\` DROP COLUMN \`telefone\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`telefone\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`id_cliente\` \`id_cliente\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`lucro\` \`lucro\` decimal(12,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`vendas\` CHANGE \`valor_total\` \`valor_total\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` CHANGE \`valor_pago\` \`valor_pago\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`produtos\` CHANGE \`tipo_produto\` \`tipo_produto\` enum ('ovos', 'mel', 'outros') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`clienteId\``);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` DROP COLUMN \`vendaId\``);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`clientes\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`vendas\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`vendas\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`id_cliente\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`id_venda\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`produtos\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`produtos\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`DROP TABLE \`itens_venda\``);
        await queryRunner.query(`ALTER TABLE \`vendas\` ADD CONSTRAINT \`FK_vendas_cliente\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`clientes\`(\`id_cliente\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`vendas\` ADD CONSTRAINT \`FK_74a281e471078adc518b54229fb\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`clientes\`(\`id_cliente\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pagamentos\` ADD CONSTRAINT \`FK_pagamentos_venda\` FOREIGN KEY (\`id_venda\`) REFERENCES \`vendas\`(\`id_venda\`) ON DELETE SET NULL ON UPDATE RESTRICT`);
    }

}
