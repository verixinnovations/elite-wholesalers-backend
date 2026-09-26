import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Store a product from the external catalog' })
  create(@Body() product: CreateProductDto) {
    return this.productsService.create(product);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Upsert products from the external catalog' })
  sync(@Body() products: CreateProductDto[]) {
    return this.productsService.upsertMany(products);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() product: UpdateProductDto) {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List product categories' })
  @ApiResponse({ status: 200, type: [String] })
  async getCategories(@Req() req) {
    const categories = await this.productsService.getProductCategories();
    return categories.map((category) => ({
      ...category,
      image:
        req.protocol + '://' + req.headers.host + `/products${category.image}`,
    }));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by external ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
