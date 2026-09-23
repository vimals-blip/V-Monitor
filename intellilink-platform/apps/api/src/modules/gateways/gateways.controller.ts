import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GatewaysService } from './gateways.service';
import { CreateGatewaysDto, UpdateGatewaysDto } from './gateway.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('gateways')
export class GatewaysController {
  constructor(private service: GatewaysService) {}

  @Get()
  @ApiOperation({ summary: 'List all gateways' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gateway by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create gateway' })
  create(@Body() dto: CreateGatewaysDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gateway' })
  update(@Param('id') id: string, @Body() dto: UpdateGatewaysDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete gateway' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Generate secure enrollment token and provisioning bundle' })
  async enrollGateway(@Body() body: { hostname: string; siteId: string; model?: string }, @CurrentUser() user: any) {
    const enrollmentToken = `il_enroll_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const gw = await this.service.create({
      hostname: body.hostname,
      siteId: body.siteId,
      model: body.model || 'IntelliEdge-X800',
      status: 'PROVISIONING',
      enrollmentToken,
    }, user);

    return {
      gateway: gw,
      enrollmentToken,
      enrollmentUrl: `https://nog.intellilink.net/enroll?token=${enrollmentToken}`,
      instructions: 'Deploy token onto gateway bootstrap storage via USB or cloud-init.',
    };
  }

  @Post(':id/action')
  @ApiOperation({ summary: 'Execute Cisco-style remote action on edge gateway (PING, REBOOT, RESTART_SERVICE, ROTATE_KEYS, PUSH_CONFIG, FAILOVER)' })
  executeAction(
    @Param('id') id: string,
    @Body() body: { action: string; target?: string; service?: string; params?: any },
    @CurrentUser() user: any,
  ) {
    return this.service.performAction(id, body, user);
  }

  @Get(':id/wireguard-config')
  @ApiOperation({ summary: 'Get generated WireGuard configuration for gateway interface' })
  getWireGuardConfig(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getWireGuardConfig(id, user);
  }

  @Get(':id/install-script')
  @ApiOperation({ summary: 'Generate one-line bash installer script for live edge router/host' })
  getInstallScript(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getInstallScript(id, user);
  }

  @Post(':id/decommission')
  @ApiOperation({ summary: 'Decommission edge gateway safely' })
  async decommission(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'DECOMMISSIONED' }, user);
  }
}
