import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CreateProductDto } from './dto/create-product.dto';
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

  @Get('/featured')
  @Public()
  @ApiOperation({ summary: 'List featured products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  @Post()
  @ApiOperation({ summary: 'Store a product from the external catalog' })
  create(@Body() product: CreateProductDto) {
    return this.productsService.create(product);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List products categories' })
  @ApiResponse({ status: 200, type: [String] })
  async getCategories(@Req() req) {
    const categories = await this.productsService.getProductCategories();
    return categories.map((category) => ({
      ...category,
      image:
        req.protocol + '://' + req.headers.host + `/products${category.image}`,
    }));
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: 'List products subcategories by categoryId' })
  @ApiResponse({ status: 200, type: [String] })
  getSubCategories(@Param('id') id: string, @Req() req) {
    const hostUrl = req.protocol + '://' + req.headers.host + '/products';
    const categories = this.productsService.getProductSubCategories(
      id,
      hostUrl,
    );
    return categories;
  }

  @Get('categories/:categoryId/products')
  @Public()
  @ApiOperation({ summary: 'List products by categoryId' })
  @ApiResponse({ status: 200, type: [String] })
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    const categories =
      await this.productsService.getProductByCategoryId(categoryId);
    return categories;
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by external ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
