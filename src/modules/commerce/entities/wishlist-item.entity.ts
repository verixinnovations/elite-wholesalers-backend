import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wishlist_items')
@Index(['userId', 'wishlistVariantId'], { unique: true })
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @Column({ name: 'wishlist_variant_id', type: 'varchar', length: 64 })
  wishlistVariantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
