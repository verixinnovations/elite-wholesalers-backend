import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PriceDto } from '../dto/create-cart.dto';
import { AccountType } from '../../user/dto/create-user.dto';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  cartId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  zohoContactId: string;

  @Column({ type: 'enum', enum: AccountType, nullable: true })
  accountType: string;

  @Column({ type: 'jsonb', nullable: false })
  price: PriceDto;

  @Column({ type: 'varchar', nullable: false })
  itemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  computeTotalAndFormat() {
    if (this.price) {
      if (this.price && typeof this.price.amount === 'number') {
        this.total = Number(this.price.amount * this.quantity);
      }
    }
  }
}
