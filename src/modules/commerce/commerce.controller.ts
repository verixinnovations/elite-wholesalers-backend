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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IRequest } from '../../common/interface';
import {
  AddCartItemDto,
  AddWishlistItemDto,
  UpdateCartItemDto,
} from './dto/commerce.dto';
import { CommerceService } from './commerce.service';

@ApiTags('Commerce')
@ApiBearerAuth()
@Controller()
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get('cart')
  @ApiOperation({ summary: 'Get the current user cart' })
  getCart(@Req() req: IRequest) {
    return this.commerceService.getCart(req.user.id);
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Add a product to the cart' })
  addToCart(@Req() req: IRequest, @Body() dto: AddCartItemDto) {
    return this.commerceService.addToCart(req.user.id, dto);
  }

  @Patch('cart/items/:itemId')
  updateCartItem(
    @Req() req: IRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.commerceService.updateCartItem(req.user.id, itemId, dto);
  }

  @Delete('cart/items/:itemId')
  removeFromCart(@Req() req: IRequest, @Param('itemId') itemId: string) {
    return this.commerceService.removeFromCart(req.user.id, itemId);
  }

  @Delete('cart')
  clearCart(@Req() req: IRequest) {
    return this.commerceService.clearCart(req.user.id);
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get the current user wishlist' })
  getWishlist(@Req() req: IRequest) {
    return this.commerceService.getWishlist(req.user.id);
  }

  @Post('wishlist/toggle')
  @ApiOperation({ summary: 'Add or remove a product from the wishlist' })
  toggleWishlist(@Req() req: IRequest, @Body() dto: AddWishlistItemDto) {
    return this.commerceService.toggleWishlist(req.user.id, dto);
  }

  @Delete('wishlist/:productId')
  removeFromWishlist(
    @Req() req: IRequest,
    @Param('productId') productId: string,
  ) {
    return this.commerceService.removeFromWishlist(req.user.id, productId);
  }

  @Post('orders/checkout')
  @ApiOperation({ summary: 'Create an order from the current cart' })
  checkout(@Req() req: IRequest) {
    return this.commerceService.checkout(req.user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List the current user orders' })
  findOrders(@Req() req: IRequest) {
    return this.commerceService.findOrders(req.user.id);
  }

  @Get('orders/:orderId')
  findOrder(@Req() req: IRequest, @Param('orderId') orderId: string) {
    return this.commerceService.findOrder(req.user.id, orderId);
  }

  @Patch('orders/:orderId/cancel')
  cancelOrder(@Req() req: IRequest, @Param('orderId') orderId: string) {
    return this.commerceService.cancelOrder(req.user.id, orderId);
  }
}
