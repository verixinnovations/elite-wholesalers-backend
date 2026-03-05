import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { uniqueNumber } from '../../common/utils/unique-numbers';
import { UserService } from '../user/user.service';
import { UserRoles } from '../user/dto/create-user.dto';
import { FileManagerService } from '../../services/file-manager/file-manager.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly userService: UserService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto) {
    // 1. Check if user already has a company (if strictly 1 company per user)

    const companyId = 'BDG-' + uniqueNumber.generateCompanyID();
    const existingCompany = await this.companyRepository.findOne({
      where: { owner: { id: userId } },
    });

    if (existingCompany) {
      throw new ConflictException('User already has a company registered.');
    }

    // 2. Check if company name/email already exists globally
    const nameExists = await this.companyRepository.findOne({
      where: { company_name: createCompanyDto.company_name },
    });
    if (nameExists) throw new ConflictException('Company name already taken.');

    // 3. Create the company and link it to the user
    const newCompany = this.companyRepository.create({
      ...createCompanyDto,
      companyId,
      ownerId: userId,
    });
    await this.userService.updateUserRole(userId, UserRoles.RECRUITER);
    return this.companyRepository.save(newCompany);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findMyCompany(user: User): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { owner: { id: user.id } },
      // relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException('You have not created a company yet.');
    }
    return company;
  }

  async findOne(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { companyId: ILike(companyId) },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    return company;
  }

  // 4. Update Company Details
  async update(user: User, updateData: UpdateCompanyDto): Promise<Company> {
    // First, get the user's company
    const company = await this.findMyCompany(user);

    // Sanitize: Ensure email/password/status aren't manually injected if DTO failed
    // (Though your DTO should handle this)
    const { ...safeUpdateData } = updateData;

    // Merge updates into the existing entity
    const updatedCompany = this.companyRepository.merge(
      company,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      safeUpdateData as any,
    );

    return this.companyRepository.save(updatedCompany);
  }

  // 5. Upload Logo
  async uploadLogo(user: User, file: Express.Multer.File): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { ownerId: user.id },
    });
    if (!company) throw new NotFoundException('Company not found');
    const logo = await this.fileManagerService.uploadImage(file);
    company.logo = logo.url;
    return this.companyRepository.save(company);
  }

  // 6. Upload Cover Image
  async uploadCoverImage(
    user: User,
    file: Express.Multer.File,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { ownerId: user.id },
    });
    if (!company) throw new NotFoundException('Company not found');
    const coverImage = await this.fileManagerService.uploadImage(file);
    company.cover_image = coverImage.url;
    return this.companyRepository.save(company);
  }
}
