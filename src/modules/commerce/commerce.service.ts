import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  AddCartItemDto,
  AddWishlistItemDto,
  UpdateCartItemDto,
} from './dto/commerce.dto';
import { CartItem } from './entities/cart-item.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class CommerceService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return this.withProducts(items);
  }

  async addToCart(userId: string, dto: AddCartItemDto) {
    await this.requireProduct(dto.productId);
    const existing = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    const item = existing
      ? this.cartRepository.merge(existing, {
          quantity: existing.quantity + dto.quantity,
        })
      : this.cartRepository.create({ userId, ...dto });
    return this.cartRepository.save(item);
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cartRepository.save(item);
  }

  async removeFromCart(userId: string, itemId: string) {
    const result = await this.cartRepository.delete({ id: itemId, userId });
    if (!result.affected) throw new NotFoundException('Cart item not found');
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
  }

  async getWishlist(userId: string) {
    const items = await this.wishlistRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const products = await this.productRepository.findBy({
      id: In(items.map((item) => item.productId)),
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    return items.map((item) => ({
      ...item,
      product: productsById.get(item.productId),
    }));
  }

  async toggleWishlist(userId: string, dto: AddWishlistItemDto) {
    const product = await this.requireProduct(dto.productId);
    const existing = await this.wishlistRepository.findOne({
      where: { userId, wishlistVariantId: product.wishlistVariantId },
    });
    if (existing) {
      await this.wishlistRepository.remove(existing);
      return { wishlisted: false, productId: product.id };
    }
    await this.wishlistRepository.save(
      this.wishlistRepository.create({
        userId,
        productId: product.id,
        wishlistVariantId: product.wishlistVariantId,
      }),
    );
    return { wishlisted: true, productId: product.id };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const result = await this.wishlistRepository.delete({ userId, productId });
    if (!result.affected)
      throw new NotFoundException('Wishlist item not found');
  }

  async checkout(userId: string) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    const products = await this.productRepository.findBy({
      id: In(cartItems.map((item) => item.productId)),
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const missingProduct = cartItems.find(
      (item) => !productsById.has(item.productId),
    );
    if (missingProduct)
      throw new BadRequestException('Cart contains an unavailable product');

    const productList = cartItems.map(
      (item) => productsById.get(item.productId)!,
    );
    const currencyCode = productList[0].currencyCode;
    if (productList.some((product) => product.currencyCode !== currencyCode)) {
      throw new BadRequestException(
        'All cart products must use the same currency',
      );
    }

    const items = cartItems.map((cartItem) => {
      const product = productsById.get(cartItem.productId)!;
      const unitPrice = Number(product.price);
      return this.orderItemRepository.create({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        currencyCode: product.currencyCode,
        unitPrice,
        quantity: cartItem.quantity,
        subtotal: unitPrice * cartItem.quantity,
      });
    });
    const order = this.orderRepository.create({
      userId,
      currencyCode,
      total: items.reduce((total, item) => total + item.subtotal, 0),
      items,
    });
    const savedOrder = await this.orderRepository.save(order);
    await this.cartRepository.delete({ userId });
    return savedOrder;
  }

  findOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.findOrder(userId, orderId);
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException('This order can no longer be cancelled');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  private async requireProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async withProducts(items: CartItem[]) {
    const products = await this.productRepository.findBy({
      id: In(items.map((item) => item.productId)),
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    return items.map((item) => ({
      ...item,
      product: productsById.get(item.productId),
    }));
  }
}
