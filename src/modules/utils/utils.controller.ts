import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { Public } from '../../common/decorators';
import { VerifyAbnDto, VerifyLicenseDto } from './dto/verify.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import {
  CheckDuplicateDto,
  SupportedCitiesDto,
  SupportedStatesDto,
} from '../user/dto/create-user.dto';
import { ContactUsDto } from './dto/contact-us.dto';
import { FirmwareService } from '../firmware/firmware.service';

@Controller('utils')
@Public()
export class UtilsController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly userService: UserService,
    private readonly firmwareService: FirmwareService,
  ) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get Supported Countries' })
  getCountries() {
    return this.utilsService.getSupportedCountries();
  }

  @Get('states')
  @ApiOperation({ summary: 'Get Supported States' })
  getStatesByCountries(@Query() query: SupportedStatesDto) {
    return this.utilsService.getStatesByCountry(query.country);
  }

  @Get('firmware-updates')
  @ApiOperation({ summary: 'Get all firmware categories with nested items' })
  findAllCategories() {
    return this.firmwareService.findAllCategories();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get Supported Countries' })
  getCitiesByState(@Query() query: SupportedCitiesDto) {
    return this.utilsService.getCitiesByState(query.country, query.state);
  }

  @Post('check-duplicates')
  @ApiOperation({ summary: 'Check duplicate user info' })
  checkDuplicates(@Body() data: CheckDuplicateDto) {
    return this.userService.checkDuplicateField(data.field, data.value);
  }

  @Post('contact-us')
  @ApiOperation({ summary: 'Submit a contact us form to elitewholesalers' })
  sendContactUsMessage(@Body() data: ContactUsDto) {
    return this.utilsService.sendContactUsMessage(data);
  }

  @Get('verify-abn')
  @ApiOperation({ summary: 'Verify ABN' })
  verifyAbn(@Query() query: VerifyAbnDto) {
    return this.utilsService.fetchABNDetails(query.abn);
  }

  @Get('verify-licence')
  @ApiOperation({ summary: 'Verify License Number' })
  verifyLicence(@Query() query: VerifyLicenseDto) {
    return this.utilsService.fetchLicenseData(
      query.licenceNumber,
      query.stateIssued,
    );
  }
}
