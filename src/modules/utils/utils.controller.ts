import { Controller, Get, Query } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { Public } from '../../common/decorators';
import { VerifyAbnDto, VerifyLicenseDto } from './dto/verify.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('utils')
@Public()
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

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
