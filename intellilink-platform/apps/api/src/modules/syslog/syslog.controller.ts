import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyslogService } from './syslog.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Syslog Server (RFC 5424 / 3164)')
@Controller('syslog')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SyslogController {
  constructor(private readonly syslogService: SyslogService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated syslog records with severity filtering' })
  async getLogs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('severity') severity?: string,
    @Query('hostname') hostname?: string,
    @Query('search') search?: string,
  ) {
    return this.syslogService.getLogs({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 25,
      severity,
      hostname,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get syslog severity distribution and ingestion stats' })
  async getStats() {
    return this.syslogService.getStats();
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Inject an RFC syslog line to test parser and real-time dashboard events' })
  async simulateLog(
    @Body()
    body: {
      raw?: string;
      sourceIp?: string;
    },
  ) {
    const raw =
      body.raw ||
      `<187>${new Date().toDateString()} cisco-isr-edge %LINK-3-UPDOWN: Interface GigabitEthernet0/0/2, changed state to down`;
    const sourceIp = body.sourceIp || '192.168.0.50';
    return this.syslogService.parseAndIngestLog(raw, sourceIp);
  }
}
