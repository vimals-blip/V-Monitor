import { Controller, Get, Post, Body, Req, Res, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { NetworkDiscoveryService } from './network-discovery.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Network Discovery & Physical Hardware')
@Controller('network-discovery')
export class NetworkDiscoveryController {
  constructor(private readonly service: NetworkDiscoveryService) {}

  @Get('interfaces')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get physical network interfaces & live byte counters directly from Linux kernel' })
  async getInterfaces() {
    return this.service.getHostNetworkInterfaces();
  }

  @Post('scan')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Discover live network devices from local subnet, neighbor table and custom target IPs' })
  async scanNetwork(@Body() body: { probePorts?: boolean; targetSubnet?: string; customIps?: string[] }) {
    return this.service.scanNetwork(body);
  }

  @Post('ingest')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Ingest discovered physical equipment into MySQL (gateways, sites, WAN circuits)' })
  async ingestDevices(@Body() body: { deviceIps?: string[] }, @CurrentUser() user: any) {
    return this.service.ingestDiscoveredDevices({
      ...body,
      organizationId: user?.organizationId,
      tenantId: user?.tenantId,
    });
  }

  @Post('purge-seed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Purge synthetic demo seed data and run exclusively on real discovered enterprise hardware' })
  async purgeSeedData() {
    return this.service.purgeSyntheticSeedData();
  }

  @Post('full-live-bootstrap')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Purge all dummy seed data across all modules and auto-initialize 100% genuine live enterprise network hierarchy' })
  async fullLiveBootstrap(@Body() body: { clientTenantName?: string; targetIps?: string[] }, @CurrentUser() user: any) {
    return this.service.fullLiveBootstrap(body, user);
  }

  @Get('poller/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get live kernel poller status' })
  getPollerStatus() {
    return this.service.getPollerStatus();
  }

  @Post('poller/toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Start or stop real network telemetry background poller' })
  togglePoller(@Body() body: { enabled: boolean; intervalMs?: number }) {
    if (body.enabled) {
      this.service.startLiveKernelPoller(body.intervalMs || 5000);
    } else {
      this.service.stopLiveKernelPoller();
    }
    return this.service.getPollerStatus();
  }

  @Public()
  @Get('agent/install.sh')
  @ApiOperation({ summary: 'Get automated 1-command installer script for physical edge routers' })
  getAgentInstallScript(@Req() req: Request, @Res() res: Response) {
    const host = req.get('host') || 'localhost:3001';
    const script = this.service.getAgentInstallScript(host);
    res.setHeader('Content-Type', 'text/x-shellscript');
    res.setHeader('Content-Disposition', 'inline; filename="install.sh"');
    res.send(script);
  }

  @Public()
  @Post('agent/register')
  @ApiOperation({ summary: 'Register external edge hardware agent' })
  async registerAgent(@Body() body: { hostname: string; ip: string; mac: string; machineId: string }) {
    return this.service.registerAgent(body);
  }
}
