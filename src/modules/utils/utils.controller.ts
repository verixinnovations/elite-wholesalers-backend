import { Controller, Get } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { Public } from '../../common/decorators';

@Controller('utils')
@Public()
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('insights')
  getInsights() {
    return this.utilsService.getInsights();
  }
}
