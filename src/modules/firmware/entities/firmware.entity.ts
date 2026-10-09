import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('firmware_categories')
export class FirmwareCategory {
  @ApiProperty({ description: 'Category UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Category name/slug' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Category display title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Display order index', default: 0 })
  @Column({ type: 'int', default: 0 })
  order: number;

  @ApiProperty({ type: () => [FirmwareItem] })
  @OneToMany(() => FirmwareItem, (item) => item.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: FirmwareItem[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('firmware_items')
export class FirmwareItem {
  @ApiProperty({ description: 'Item UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Resource title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Version string' })
  @Column()
  version: string;

  @ApiProperty({ description: 'Release date' })
  @Column({ type: 'timestamp' })
  date: Date;

  @ApiProperty({ description: 'File size' })
  @Column()
  size: string;

  @ApiProperty({ description: 'Download link URL' })
  @Column()
  downloadLink: string;

  @ApiProperty({ description: 'Display order index', default: 0 })
  @Column({ type: 'int', default: 0 })
  order: number;

  @ApiProperty({ description: 'Category ID reference' })
  @Column()
  categoryId: string;

  @ApiProperty({ type: () => FirmwareCategory })
  @ManyToOne(() => FirmwareCategory, (category) => category.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: FirmwareCategory;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
