import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('produto')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}


  @Post()
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiBody({ type: CreateProdutoDto })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.', schema: { example: { id: 1, nomeProduto: 'Ovo Branco', tipoProduto: 'outro', preco: 12.5 } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  create(@Body() dto: CreateProdutoDto) {
    return this.produtoService.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Lista todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos.', schema: { example: [{ id: 1, nomeProduto: 'Ovo Branco', tipoProduto: 'outro', preco: 12.5 }] } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  findAll() {
    return this.produtoService.findAll();
  }


  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado.', schema: { example: { id: 1, nomeProduto: 'Ovo Branco', tipoProduto: 'outro', preco: 12.5 } } })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.', schema: { example: { statusCode: 404, message: 'Produto não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  findOne(@Param('id') id: string) {
    return this.produtoService.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um produto' })
  @ApiBody({
    type: UpdateProdutoDto,
    examples: {
      exemplo: {
        summary: 'Exemplo de atualização de produto',
        value: {
          nomeProduto: 'Ovo Branco',
          tipoProduto: 'outro',
          preco: 12.5
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Produto atualizado.', schema: { example: { id: 1, nomeProduto: 'Ovo Branco', tipoProduto: 'outro', preco: 13.0 } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.', schema: { example: { statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' } } })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.', schema: { example: { statusCode: 404, message: 'Produto não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    console.log(`Atualizando produto ID ${id} com dados:`, dto);
    return this.produtoService.update(+id, dto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Remove um produto' })
  @ApiResponse({ status: 200, description: 'Produto removido.', schema: { example: { message: 'Produto removido com sucesso.' } } })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.', schema: { example: { statusCode: 404, message: 'Produto não encontrado', error: 'Not Found' } } })
  @ApiResponse({ status: 500, description: 'Erro interno.', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' } } })
  remove(@Param('id') id: string) {
    return this.produtoService.remove(+id);
  }
}
