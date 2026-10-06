import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileManagerService } from '../../services/file-manager/file-manager.service';
import { AccountType } from './dto/create-user.dto';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';

@Injectable()
export class UserService {
  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly zohoInventoryService: ZohoInventoryService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(param: object) {
    const user = await this.userRepository.findOneBy(param);
    if (!user) throw new NotFoundException('User not found');
    const zohoDetails = await this.zohoInventoryService.getCustomer(
      user.zohoContactId,
    );

    return { ...user, zoho_details: zohoDetails };
  }

  async viewUser(userId: string) {
    return this.findOne({ id: userId });
  }

  async getUserProfileSummary(userId: string) {
    const user = await this.viewUser(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      picture: user.picture,
      accountType: user.accountType,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, username, accountType, ...data } = updateUserDto;
    const user = await this.userRepository.preload({
      id,
      ...data,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async updateUserRole(id: string, accountType: AccountType): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      accountType,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async uploadPicture(userId: string, file: Express.Multer.File) {
    const user = await this.viewUser(userId);
    const picture = await this.fileManagerService.uploadImage(file);
    user.picture = picture.url;
    return this.userRepository.save(user);
  }

  // async uploadResume(userId: string, file: Express.Multer.File) {
  //   const user = await this.viewUser(userId);
  //   const resume = await this.fileManagerService.uploadResume(file);
  //   user.resume = {
  //     name: resume.name,
  //     url: resume.url,
  //     format: resume.format,
  //   };
  //   return this.userRepository.save(user);
  // }

  /**
   * this function is used to remove or delete user from database.
   * @param id is the type of number, which represent id of user
   * @returns nuber of rows deleted or affected
   */

  async removeUser(id: string): Promise<DeleteResult> {
    const result: DeleteResult = await this.userRepository.softDelete(id);

    // In practice, affected is 0 when no rows are deleted; it is almost never null
    // However, the type allows null, so we handle affected === 0 || affected === null
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }

  async checkDuplicateField(field: string, value: any) {
    if (!value) {
      return { is_available: true };
    }

    const processedValue = typeof value === 'string' ? value.trim() : value;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (field.includes('.')) {
      // Handles nested JSON/JSONB fields like 'business_details.licence_number'
      const [parent, child] = field.split('.');

      // Uses Postgres JSON operator (->>) and LOWER() for case-insensitive matching
      queryBuilder.where(`LOWER(user.${parent} ->> :childKey) = LOWER(:val)`, {
        childKey: child,
        val: processedValue,
      });
    } else {
      // Handles flat columns with optional mapping (e.g. username -> user_name)
      const fieldMapping: Record<string, string> = { username: 'user_name' };
      const dbColumn = fieldMapping[field] || field;

      queryBuilder.where(`LOWER(user.${dbColumn}) = LOWER(:val)`, {
        val: processedValue,
      });
    }

    // Execute query
    const user = await queryBuilder.getOne();

    if (user) {
      const lastField = field.includes('.') ? field.split('.').pop() : field;
      const readableField = lastField!.replace(/_/g, ' ');
      const formattedField =
        readableField.charAt(0).toUpperCase() + readableField.slice(1);

      throw new BadRequestException({
        message: `${formattedField} already exists!`,
        error_code: `DUPLICATE_${lastField!.toUpperCase()}`,
      });
    }

    return { is_available: true };
  }
}
