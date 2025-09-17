import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  create(dto: CreateProdutoDto) {
    const produto = this.produtoRepository.create(dto);
    return this.produtoRepository.save(produto);
  }

  findAll() {
    return this.produtoRepository.find();
  }

  async findOne(id: number) {
    const produto = await this.produtoRepository.findOneBy({ id: id });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    const produto = await this.findOne(id); 
    await this.produtoRepository.update(id, dto);
    const produtoAtualizado = await this.produtoRepository.findOneBy({ id: id });
    console.log(`Produto ID ${id} atualizado com sucesso:`, produtoAtualizado);
    return produtoAtualizado; 
  }

  async remove(id: number) {
    const produto = await this.findOne(id); 
    return this.produtoRepository.delete(id);
  }
}
