import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProvisioningService } from './provisioning.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Provisioning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provisioning')
export class ProvisioningController {
  constructor(private service: ProvisioningService) {}

  @Post('site')
  @ApiOperation({ summary: 'Execute automated 12-step zero-touch site provisioning workflow' })
  async provisionSite(@Body() body: any, @CurrentUser() user: any) {
    return this.service.provisionSite(body, user);
  }
}
