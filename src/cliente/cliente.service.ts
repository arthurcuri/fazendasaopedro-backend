import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';


@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private repo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
  const cliente = this.repo.create(dto);
  return this.repo.save(cliente);
  }


  findAll(): Promise<Cliente[]> {
    return this.repo.find();
  }


  findOne(id: number): Promise<Cliente | null> {
    return this.repo.findOne({ where: { id } });
  }


  async update(id: number, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }
    Object.assign(cliente, dto);
    return this.repo.save(cliente);
  }

  remove(id: number): Promise<import("typeorm").DeleteResult> {
    return this.repo.delete(id);
  }
}
