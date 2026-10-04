import { Injectable, Logger } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { UserService } from '../user/user.service';
// import { ZohoApiClient } from './zoho-api.util'; // Your HTTP client
// import { UserRepository } from '../user/user.repository';

@Injectable()
export class CartService {
  constructor(
    private zohoInventoryService: ZohoInventoryService,
    private userService: UserService,
  ) {}

  private logger = new Logger(CartService.name);

  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }

  async initializeCheckout(userId: string, cartItems: CreateCartDto[]) {
    const user = await this.userService.findOne({ id: userId });
    if (!user || !user.zohoContactId) {
      throw new InternalServerErrorException('User is not synced with Zoho');
    }

    // 2. Format the initial line items for the Sales Order
    const soLineItems = cartItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      rate: item.price.amount,
    }));

    // 3. Build the Sales Order Payload
    const salesOrderPayload = {
      customer_id: user.zohoContactId,
      line_items: soLineItems,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
    };

    try {
      // 4. Step A: Create the Sales Order first
      this.logger.log(salesOrderPayload);
      this.logger.log('Creating sales order ...');

      const salesOrder =
        await this.zohoInventoryService.createSalesOrder(salesOrderPayload);
      this.logger.log(salesOrder);
      const salesOrderId = salesOrder.salesorder_id;
      const returnedLineItems = salesOrder.line_items || [];

      // 5. Step B: Map the line items using `salesorder_item_id` from the Sales Order response
      const invoiceLineItems = returnedLineItems.map((soItem: any) => ({
        salesorder_item_id: soItem.line_item_id,
        item_id: soItem.item_id,
        quantity: soItem.quantity,
        rate: soItem.rate,
      }));

      // 6. Step C: Create the Invoice as a draft first (keeping your safe approach)
      const invoicePayload = {
        customer_id: user.zohoContactId,
        salesorder_id: salesOrderId,
        line_items: invoiceLineItems,
        status: 'draft',
        payment_options: {
          payment_gateways: [
            {
              configured: true,
              additional_field1: 'standard',
              gateway_name: 'stripe',
            },
          ],
        },
      };

      this.logger.log(invoicePayload);
      this.logger.log('Creating invoice');

      const invoice =
        await this.zohoInventoryService.createInvoice(invoicePayload);
      this.logger.log(invoice);
      // 7. Step D: Explicitly mark it as sent to activate the secure payment link
      this.logger.log('Marking invoice as sent');
      await this.zohoInventoryService.markInvoiceAsSent(invoice.invoice_id);
      // 8. Return the structured response with the secure payment URL
      return {
        message: 'Checkout initialized successfully',
        sales_order_id: salesOrderId,
        invoice_id: invoice.invoice_id,
        payment_url: invoice.invoice_url,
      };
    } catch (error) {
      console.error(
        'Zoho Checkout Error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to generate Zoho checkout link',
      );
    }
  }
}
