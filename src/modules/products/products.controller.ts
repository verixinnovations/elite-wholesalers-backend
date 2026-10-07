import { Body, Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CreateProductDto, ProductQueryDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { generatePriceByAccountType } from '../../common/utils/price-generator.utils';
import type { IRequest } from '../../common/interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  async findAll(@Req() req: IRequest, @Query() query?: ProductQueryDto) {
    const products = await this.productsService.findAll(query);
    return products.map(generatePriceByAccountType(req?.user?.accountType));
  }

  @Get('/featured')
  @Public()
  @ApiOperation({ summary: 'List featured products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  async getFeaturedProducts(@Req() req: IRequest) {
    const featuredProducts = await this.productsService.getFeaturedProducts();
    return featuredProducts.map(
      generatePriceByAccountType(req?.user?.accountType),
    );
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List products categories' })
  @ApiResponse({ status: 200, type: [String] })
  async getCategories(@Req() req: IRequest) {
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
  getSubCategory(@Param('id') id: string) {
    return this.productsService.getProductCategory(id);
  }

  @Get('categories/:id/subcategories')
  @Public()
  @ApiOperation({ summary: 'List products subcategories by categoryId' })
  @ApiResponse({ status: 200, type: [String] })
  getSubCategories(@Param('id') id: string, @Req() req: IRequest) {
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
  async getProductsByCategory(
    @Req() req: IRequest,
    @Param('categoryId') categoryId: string,
    @Query() query?: ProductQueryDto,
  ) {
    const productsByCategoryId =
      await this.productsService.getProductByCategoryId(categoryId, query);
    return productsByCategoryId.map(
      generatePriceByAccountType(req?.user?.accountType),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by ID' })
  async findOne(@Req() req: IRequest, @Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    const productWithPrice = [product].map(
      generatePriceByAccountType(req?.user?.accountType),
    );
    return productWithPrice[0];
  }
}
