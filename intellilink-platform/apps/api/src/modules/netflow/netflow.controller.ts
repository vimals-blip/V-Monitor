import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NetflowService } from './netflow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('NetFlow / IPFIX Flow Collector')
@Controller('netflow')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NetflowController {
  constructor(private readonly netflowService: NetflowService) {}

  @Get('flows')
  @ApiOperation({ summary: 'Get recent parsed NetFlow records' })
  async getFlows(@Query('limit') limit?: string) {
    return this.netflowService.getRecentFlows(limit ? parseInt(limit, 10) : 50);
  }

  @Get('top-talkers')
  @ApiOperation({ summary: 'Get aggregated Top Talkers by source IP, destination IP, and application' })
  async getTopTalkers() {
    return this.netflowService.getTopTalkers();
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Inject sample flow packet to test aggregation pipeline' })
  async simulateFlow(
    @Body()
    body: {
      srcIp?: string;
      dstIp?: string;
      bytes?: number;
      application?: string;
    },
  ) {
    return this.netflowService.saveFlow({
      srcIp: body.srcIp || '192.168.0.77',
      dstIp: body.dstIp || '10.244.0.1',
      srcPort: 53100,
      dstPort: 51820,
      protocol: 'UDP',
      bytes: body.bytes || 5242880,
      packets: 3600,
      application: body.application || 'WireGuard-Mesh',
      deviceIp: '192.168.0.1',
    });
  }
}
