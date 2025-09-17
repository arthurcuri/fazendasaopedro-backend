import { Test, TestingModule } from '@nestjs/testing';
import { ItemVendaController } from './item-venda.controller';
import { ItemVendaService } from './item-venda.service';

describe('ItemVendaController', () => {
  let controller: ItemVendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemVendaController],
      providers: [ItemVendaService],
    }).compile();

    controller = module.get<ItemVendaController>(ItemVendaController);
  });

  it('Deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
