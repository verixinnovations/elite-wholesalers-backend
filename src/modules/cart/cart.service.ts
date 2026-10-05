import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AccountType } from '../user/dto/create-user.dto';
import { generatePriceByAccountType } from '../../common/utils/price-generator.utils';
import { CommerceService } from '../commerce/commerce.service';
// import { ZohoApiClient } from './zoho-api.util'; // Your HTTP client
// import { UserRepository } from '../user/user.repository';

@Injectable()
export class CartService {
  constructor(
    private zohoInventoryService: ZohoInventoryService,
    private userService: UserService,
    private commerceService: CommerceService,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  private logger = new Logger(CartService.name);

  async getCart(userId: string, accountType: AccountType) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    const productIds = cartItems.map((cart) => cart.itemId);
    const products = await Promise.all(
      productIds.map((productId) =>
        this.zohoInventoryService.getInventoryItem(productId),
      ),
    );

    return cartItems.map((item) => {
      const product = products
        .map(generatePriceByAccountType(accountType))
        .find((product) => product.item_id === item.itemId);
      return {
        ...item,
        product,
      };
    });
  }

  async addToCart(userId: string, zohoContactId: string, dto: CreateCartDto) {
    let cartItem = await this.cartRepository.findOne({
      where: { userId, itemId: dto.item_id },
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
      cartItem.price = dto.price;
      cartItem.zohoContactId = zohoContactId;
    } else {
      cartItem = this.cartRepository.create({
        userId,
        itemId: dto.item_id,
        quantity: dto.quantity,
        zohoContactId: zohoContactId,
        price: dto.price,
      });
    }

    // Entity lifecycle hooks will automatically recalculate `total` on save
    return await this.cartRepository.save(cartItem);
  }

  async updateCartItem(userId: string, cartId: string, dto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { cartId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = dto.quantity;
    // Saving triggers `@BeforeUpdate`, which recalculates `total` using the new quantity
    return await this.cartRepository.save(cartItem);
  }

  async deleteCartItem(userId: string, cartId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: { cartId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
    return { message: 'Cart item removed successfully' };
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: 'Cart cleared successfully' };
  }

  async initializeCheckout(userId: string, accountType: AccountType) {
    // 1. Fetch user and verify Zoho sync
    const user = await this.userService.findOne({ id: userId });
    if (!user || !user.zohoContactId) {
      throw new InternalServerErrorException('User is not synced with Zoho');
    }

    // 2. Fetch ALL cart items for this user from the database
    const cartItems = await this.cartRepository.find({
      where: { userId: userId },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Your cart is empty');
    }

    // 3. Map database cart items to Zoho line items safely using backend price
    const soLineItems = cartItems.map((item) => ({
      item_id: item.itemId,
      quantity: item.quantity,
      rate: item.price.amount,
      custom_fields: [
        {
          label: 'accountType',
          value: accountType,
        },
        {
          label: 'sellingPrice',
          value: item.price.amount,
        },
      ],
    }));

    const salesOrderPayload = {
      customer_id: user.zohoContactId,
      line_items: soLineItems,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
    };

    try {
      const salesOrder =
        await this.zohoInventoryService.createSalesOrder(salesOrderPayload);
      const salesOrderId: string = salesOrder.salesorder_id;
      const paymentDetails = this.commerceService.pay(userId, salesOrderId);
      await this.cartRepository.delete({ userId: userId });
      return paymentDetails;
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
