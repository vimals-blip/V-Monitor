import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SnmpService } from './snmp.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('SNMP Monitoring & Traps')
@Controller('snmp')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SnmpController {
  constructor(private readonly snmpService: SnmpService) {}

  @Post('poll')
  @ApiOperation({ summary: 'Poll MIB-2 OIDs from a Cisco, MikroTik, or Linux edge device' })
  async pollDevice(
    @Body()
    body: {
      host: string;
      community?: string;
      port?: number;
      version?: string;
    },
  ) {
    return this.snmpService.pollDevice(body.host, body.community || 'public', body.port || 161, body.version || '2c');
  }

  @Get('traps')
  @ApiOperation({ summary: 'Get list of received SNMP traps' })
  async getTraps(@Query('limit') limit?: string) {
    return this.snmpService.getRecentTraps(limit ? parseInt(limit, 10) : 50);
  }

  @Post('simulate-trap')
  @ApiOperation({ summary: 'Trigger a simulated SNMP trap (linkDown, linkUp, obstruction)' })
  async simulateTrap(
    @Body()
    body: {
      sourceIp?: string;
      trapType?: string;
      details?: string;
    },
  ) {
    return this.snmpService.simulateTrap(body);
  }
}
