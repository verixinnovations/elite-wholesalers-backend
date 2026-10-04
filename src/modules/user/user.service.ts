import { Injectable, NotFoundException } from '@nestjs/common';
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
}
