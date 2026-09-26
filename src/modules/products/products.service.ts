import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ZohoService } from '../zoho/zoho.service';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private zohoService: ZohoService,
    private zohoInventoryService: ZohoInventoryService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productRepository.save(
      this.productRepository.create(createProductDto),
    );
  }

  async upsertMany(products: CreateProductDto[]): Promise<Product[]> {
    return this.productRepository.save(
      products.map((product) => this.productRepository.create(product)),
    );
  }

  async findAll() {
    const products = await this.zohoInventoryService.getInventoryItems();
    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Product not found');
  }

  getProductCategories() {
    return this.zohoInventoryService.getInventoryCategories();
    // return [
    //   {
    //     id: '1',
    //     name: 'CCTV',
    //     image: '/cctv.jpeg',
    //     totalProducts: 100,
    //     slug: 'cctv-surveillance',
    //     description:
    //       'High-definition IP, analog, and PTZ surveillance cameras.',
    //     isActive: true,
    //     featured: true,
    //     inStockCount: 84,
    //     startingPrice: 45.99,
    //     tags: ['security', 'cameras', 'monitoring'],
    //   },
    //   {
    //     id: '2',
    //     name: 'Alarms',
    //     image: '/alarms.jpeg',
    //     totalProducts: 48,
    //     slug: 'security-alarms',
    //     description:
    //       'Intrusion sensors, sirens, and multi-zone control panels.',
    //     isActive: true,
    //     featured: false,
    //     inStockCount: 39,
    //     startingPrice: 29.5,
    //     tags: ['alert', 'intrusion', 'sensors'],
    //   },
    //   {
    //     id: '3',
    //     name: 'Access Control',
    //     image: '/access-control.jpeg',
    //     totalProducts: 65,
    //     slug: 'access-control-systems',
    //     description: 'Biometric terminals, RFID card readers, and smart locks.',
    //     isActive: true,
    //     featured: true,
    //     inStockCount: 50,
    //     startingPrice: 89.0,
    //     tags: ['biometrics', 'entry', 'rfid'],
    //   },
    //   {
    //     id: '4',
    //     name: 'Gun Locks',
    //     image: '/gun-locks.jpeg',
    //     totalProducts: 24,
    //     slug: 'firearm-gun-locks',
    //     description:
    //       'Trigger guards, biometric cable locks, and secure vaults.',
    //     isActive: true,
    //     featured: false,
    //     inStockCount: 18,
    //     startingPrice: 19.99,
    //     tags: ['safety', 'vaults', 'locks'],
    //   },
    //   {
    //     id: '5',
    //     name: 'Intercoms',
    //     image: '/intercoms.jpeg',
    //     totalProducts: 42,
    //     slug: 'audio-video-intercoms',
    //     description: 'Two-way video doorbells and commercial IP stations.',
    //     isActive: true,
    //     featured: false,
    //     inStockCount: 31,
    //     startingPrice: 62.0,
    //     tags: ['doorbell', 'two-way-audio', 'video'],
    //   },
    //   {
    //     id: '6',
    //     name: 'Network',
    //     image: '/network-transmission.jpeg',
    //     totalProducts: 115,
    //     slug: 'network-transmission',
    //     description:
    //       'PoE switches, patch panels, routers, and fiber transceivers.',
    //     isActive: true,
    //     featured: true,
    //     inStockCount: 97,
    //     startingPrice: 34.75,
    //     tags: ['poe', 'switches', 'cables'],
    //   },
    //   {
    //     id: '7',
    //     name: 'Automotives',
    //     image: '/automotives.jpeg',
    //     totalProducts: 36,
    //     slug: 'automotive-security',
    //     description: 'GPS fleet tracking units and dual dash cameras.',
    //     isActive: true,
    //     featured: false,
    //     inStockCount: 22,
    //     startingPrice: 55.0,
    //     tags: ['gps', 'tracking', 'dashcam'],
    //   },
    //   {
    //     id: '8',
    //     name: 'Lighting & Automation',
    //     image: '/lighting-automation.jpeg',
    //     totalProducts: 78,
    //     slug: 'smart-iot-devices',
    //     description:
    //       'Zigbee gateways, smart relays, and wireless environmental sensors.',
    //     isActive: true,
    //     featured: true,
    //     inStockCount: 65,
    //     startingPrice: 15.25,
    //     tags: ['automation', 'zigbee', 'smart-home'],
    //   },
    // ];
  }
}
