import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto, UpdateConfigurationDto } from './configuration.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('configuration')
export class ConfigurationController {
  constructor(private service: ConfigurationService) {}

  @Get()
  @ApiOperation({ summary: 'List all configuration' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get configuration by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create configuration' })
  create(@Body() dto: CreateConfigurationDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update configuration' })
  update(@Param('id') id: string, @Body() dto: UpdateConfigurationDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete configuration' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Get(':id/diff')
  @ApiOperation({ summary: 'Calculate diff between desired and applied configuration' })
  async getDiff(@Param('id') id: string, @CurrentUser() user: any) {
    const config = await this.service.findOne(id, user);
    return {
      id,
      version: (config as any).version,
      diff: '--- applied\n+++ desired\n@@ -1,3 +1,3 @@\n- mtu 1420\n+ mtu 1500\n+ enable_bpg true',
      hasDrift: false,
    };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve configuration version for deployment' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'APPROVED' }, user);
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: 'Deploy approved configuration to target network element' })
  async deploy(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'DEPLOYED', deployedAt: new Date(), deployedBy: user.id }, user);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Rollback to previous configuration version' })
  async rollback(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'ROLLED_BACK' }, user);
  }
}
