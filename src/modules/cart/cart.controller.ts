import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { IRequest } from '../../common/interface';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiResponse({ status: 201, description: 'Item successfully added to cart.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async addToCart(@Req() req: IRequest, @Body() dto: CreateCartDto) {
    const userId = req.user.id;
    const zohoContactId = req.user?.zohoContactId;
    return await this.cartService.addToCart(userId, zohoContactId, dto);
  }

  @Post('/checkout')
  @ApiOperation({
    summary: 'Initialize checkout for all items in the user cart',
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout initialized successfully.',
  })
  @ApiResponse({ status: 404, description: 'Cart is empty.' })
  @ApiResponse({ status: 500, description: 'Zoho sync or generation failure.' })
  async checkout(@Req() req: IRequest) {
    return await this.cartService.initializeCheckout(
      req.user.id,
      req.user.accountType,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all items in the user cart' })
  @ApiResponse({
    status: 200,
    description: 'Returns all cart items for the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Req() req: IRequest) {
    return await this.cartService.getCart(
      req?.user?.id,
      req?.user?.accountType,
    );
  }

  @Patch(':cartId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'cartId', description: 'The unique ID of the cart item' })
  @ApiResponse({ status: 200, description: 'Cart item successfully updated.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateCartItem(
    @Req() req: IRequest,
    @Param('cartId') cartId: string,
    @Body() dto: UpdateCartDto,
  ) {
    const userId = req.user.id;
    return await this.cartService.updateCartItem(userId, cartId, dto);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Delete a single item from the cart' })
  @ApiParam({ name: 'cartId', description: 'The unique ID of the cart item' })
  @ApiResponse({ status: 200, description: 'Cart item successfully removed.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteCartItem(@Req() req: IRequest, @Param('cartId') cartId: string) {
    const userId = req.user.id;
    return await this.cartService.deleteCartItem(userId, cartId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the user cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async clearCart(@Req() req: IRequest) {
    const userId = req.user.id;
    return await this.cartService.clearCart(userId);
  }
}
