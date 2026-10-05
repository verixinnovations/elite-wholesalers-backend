import { Body, Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IRequest } from '../../common/interface';
import { CommerceService } from './commerce.service';

@ApiTags('Commerce')
@ApiBearerAuth()
@Controller('transactions')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List the current user orders' })
  findOrders(@Req() req: IRequest) {
    return this.commerceService.findOrders(req.user.zohoContactId);
  }

  @Get('orders/:orderId/pay')
  @ApiOperation({ summary: 'Pay for a  sales order' })
  pay(@Req() req: IRequest, @Param('orderId') orderId: string) {
    return this.commerceService.pay(req.user.id, orderId);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'List a sales order' })
  findOrder(@Param('orderId') orderId: string) {
    return this.commerceService.findOrder(orderId);
  }

  // @Patch('orders/:orderId/cancel')
  // cancelOrder(@Req() req: IRequest, @Param('orderId') orderId: string) {
  //   return this.commerceService.cancelOrder(req.user.id, orderId);
  // }
}
