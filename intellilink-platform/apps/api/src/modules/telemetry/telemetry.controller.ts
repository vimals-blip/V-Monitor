import { Controller, Post, Get, Body, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Telemetry')
@Controller('telemetry/v1')
export class TelemetryController {
  constructor(private service: TelemetryService) {}

  @Public()
  @Post('gateway/heartbeat')
  @ApiOperation({ summary: 'Ingest gateway heartbeat' })
  heartbeat(@Body() body: any) {
    return this.service.ingestHeartbeat(body);
  }

  @Public()
  @Post(':sourceType/metrics')
  @ApiOperation({ summary: 'Ingest resource metrics' })
  metrics(@Param('sourceType') sourceType: string, @Body() body: any) {
    return this.service.ingestMetrics({ ...body, sourceType: sourceType.toUpperCase() });
  }

  @Get('fabric-overview')
  @ApiOperation({ summary: 'Get aggregated live telemetry overview from MySQL time-series and OS' })
  getFabricOverview() {
    return this.service.getFabricOverview();
  }

  @Get('latest/:sourceId')
  @ApiOperation({ summary: 'Get latest metrics for a source' })
  getLatest(@Param('sourceId') sourceId: string) {
    return this.service.getLatestMetrics(sourceId);
  }

  @Get('history/:sourceId')
  @ApiOperation({ summary: 'Get metrics history' })
  getHistory(@Param('sourceId') sourceId: string, @Query('limit') limit?: number) {
    return this.service.getHistory(sourceId, limit);
  }
}
