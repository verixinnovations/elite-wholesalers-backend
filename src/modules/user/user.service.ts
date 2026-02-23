import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileManagerService } from '../../services/file-manager/file-manager.service';
import { UserRoles } from './dto/create-user.dto';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly fileManagerService: FileManagerService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(param: object): Promise<User & { company?: Company | null }> {
    const user = await this.userRepository.findOneBy(param);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRoles.RECRUITER) {
      const company = await this.companyRepository.findOneBy({
        ownerId: user.id,
      });
      return Object.assign(user, { company });
    }
    return user;
  }

  async viewUser(id: string) {
    return this.findOne({ id });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, username, role, ...data } = updateUserDto;
    const user = await this.userRepository.preload({
      id,
      ...data,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async updateUserRole(id: string, role: UserRoles): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      role,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async updateUserProfilePicture(
    id: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const profilePicture = await this.fileManagerService.uploadImage(file);
    const user = await this.userRepository.preload({
      id,
      picture: profilePicture.url,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  /**
   * this function is used to remove or delete user from database.
   * @param id is the type of number, which represent id of user
   * @returns nuber of rows deleted or affected
   */
  async removeUser(id: string): Promise<DeleteResult> {
    const result: DeleteResult = await this.userRepository.delete(id);

    // In practice, affected is 0 when no rows are deleted; it is almost never null
    // However, the type allows null, so we handle affected === 0 || affected === null
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }
}
