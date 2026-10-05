import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CommerceService {
  constructor(
    private userService: UserService,
    private readonly zohoInventoryService: ZohoInventoryService,
  ) {}

  findOrders(userId: string) {
    return this.zohoInventoryService.findUserOrders(userId);
  }

  async findOrder(orderId: string) {
    return this.zohoInventoryService.findSalesOrder(orderId);
  }

  async pay(userId: string, salesorderId: string) {
    const user = await this.userService.findOne({ id: userId });
    if (!user || !user.zohoContactId) {
      throw new InternalServerErrorException('User is not synced with Zoho');
    }

    const today = new Date();
    const dueDate = new Date(today.setDate(today.getDate() + 7))
      .toISOString()
      .split('T')[0];
    try {
      const salesOrder =
        await this.zohoInventoryService.findSalesOrder(salesorderId);

      const existingInvoices = salesOrder.invoices || [];

      if (existingInvoices.length > 0) {
        const activeInvoiceId =
          existingInvoices[existingInvoices.length - 1].invoice_id;

        // 1. Fetch full details of the existing invoice
        let existingInvoice =
          await this.zohoInventoryService.getInvoice(activeInvoiceId);

        if (
          existingInvoice &&
          existingInvoice.status !== 'paid' &&
          existingInvoice.status !== 'void'
        ) {
          // 2. CHECK IF DUE DATE IS PAST (OR UPDATE IT REGARDLESS TO EXTEND IT)
          // You can calculate a new due date (e.g., today or 7 days from now in YYYY-MM-DD format)

          // 3. Update the invoice's due date and mark it as sent so the payment link refreshes
          await this.zohoInventoryService.updateInvoice(activeInvoiceId, {
            due_date: dueDate,
            // Optional reason or notes if required by your org settings
          });

          // Re-fetch or mark as sent to ensure the Stripe payment gateway link is live
          await this.zohoInventoryService.markInvoiceAsSent(activeInvoiceId);

          // Fetch the updated invoice to grab the refreshed payment url
          existingInvoice =
            await this.zohoInventoryService.getInvoice(activeInvoiceId);

          return {
            message: 'Checkout link refreshed and retrieved successfully',
            sales_order_id: salesOrder.salesorder_id,
            invoice_id: existingInvoice.invoice_id,
            payment_url: existingInvoice.invoice_url,
          };
        }
      }

      // 4. IF NO VALID EXISTING INVOICE EXISTS, PROCEED WITH CREATING A NEW ONE
      const returnedLineItems = salesOrder.line_items || [];

      const invoiceLineItems = returnedLineItems.map((soItem: any) => ({
        salesorder_item_id: soItem.line_item_id,
        item_id: soItem.item_id,
        quantity: soItem.quantity,
        rate: soItem.rate,
        custom_fields: [
          {
            label: 'accountType',
            value: user.accountType,
          },
          {
            label: 'sellingPrice',
            value: soItem.rate,
          },
        ],
      }));

      const invoicePayload = {
        customer_id: user.zohoContactId,
        salesorder_id: salesOrder.salesorder_id,
        line_items: invoiceLineItems,
        status: 'draft',
        due_date: dueDate,
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

      const invoice =
        await this.zohoInventoryService.createInvoice(invoicePayload);

      await this.zohoInventoryService.markInvoiceAsSent(invoice.invoice_id);

      return {
        message: 'Checkout initialized successfully',
        sales_order_id: salesOrder.salesorder_id,
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

// async cancelOrder(userId: string, orderId: string) {
//   return this.zohoInventoryService.cancelOrder(customerId, orderId);
// }
