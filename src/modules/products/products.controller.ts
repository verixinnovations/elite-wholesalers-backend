import { Body, Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CreateProductDto, ProductQueryDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { generatePriceByAccountType } from '../../common/utils/price-generator.utils';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  async findAll(@Req() req, @Query() query?: ProductQueryDto) {
    const products = await this.productsService.findAll(query);
    return products.map(generatePriceByAccountType(req?.user?.accountType));
  }

  @Get('/featured')
  @Public()
  @ApiOperation({ summary: 'List featured products' })
  @ApiResponse({ status: 200, type: [CreateProductDto] })
  async getFeaturedProducts(@Req() req) {
    const featuredProducts = await this.productsService.getFeaturedProducts();
    return featuredProducts.map(
      generatePriceByAccountType(req?.user?.accountType),
    );
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
  getSubCategory(@Param('id') id: string) {
    return this.productsService.getProductCategory(id);
  }

  @Get('categories/:id/subcategories')
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
  async getProductsByCategory(
    @Req() req,
    @Param('categoryId') categoryId: string,
  ) {
    const productsByCategoryId =
      await this.productsService.getProductByCategoryId(categoryId);
    return productsByCategoryId.map(
      generatePriceByAccountType(req?.user?.accountType),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by external ID' })
  async findOne(@Req() req, @Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    const productWithPrice = [product].map(
      generatePriceByAccountType(req?.user?.accountType),
    );
    return productWithPrice[0];
  }
}
