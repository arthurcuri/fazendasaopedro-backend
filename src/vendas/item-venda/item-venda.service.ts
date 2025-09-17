import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemVenda } from './entities/item-venda.entity';
import { CreateItemVendaDto } from './dto/create-item-venda.dto';

@Injectable()
export class ItemVendaService {
  constructor(
    @InjectRepository(ItemVenda)
    private readonly itemVendaRepo: Repository<ItemVenda>,
  ) {}

  async create(dto: CreateItemVendaDto): Promise<ItemVenda> {
    const item = this.itemVendaRepo.create({
      produto: { id: dto.id_produto },
      quantidade: dto.quantidade,
      precoUnitario: dto.preco_unitario,
  precoTotal: dto.quantidade * (dto.preco_unitario ?? 0),
    });

    return this.itemVendaRepo.save(item);
  }

  async findAll(): Promise<ItemVenda[]> {
    return this.itemVendaRepo.find({
      relations: ['produto', 'venda'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ItemVenda> {
    const item = await this.itemVendaRepo.findOne({
      where: { id },
      relations: ['produto', 'venda'],
    });

    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemVendaRepo.remove(item);
  }
}
