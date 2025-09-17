import { Test, TestingModule } from '@nestjs/testing';
import { ItemVendaService } from './item-venda.service';

describe('ItemVendaService', () => {
  let service: ItemVendaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemVendaService],
    }).compile();

    service = module.get<ItemVendaService>(ItemVendaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
});
