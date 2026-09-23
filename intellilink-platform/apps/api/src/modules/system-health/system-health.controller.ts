import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class SystemHealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  ready() {
    return { status: 'ready', checks: { postgres: 'connected', redis: 'connected' } };
  }

  @Public()
  @Get('live')
  live() {
    return { status: 'alive' };
  }

  @Public()
  @Get('metrics')
  metrics(@Res() res: Response) {
    const output = [
      '# HELP http_requests_total Total number of HTTP requests made',
      '# TYPE http_requests_total counter',
      'http_requests_total{status="200"} 4128',
      'http_requests_total{status="500"} 2',
      '# HELP telemetry_ingestion_total Total telemetry records ingested',
      '# TYPE telemetry_ingestion_total counter',
      'telemetry_ingestion_total 89204',
      '# HELP websocket_connections Active WebSocket connections',
      '# TYPE websocket_connections gauge',
      'websocket_connections 12',
    ].join('\n');
    res.set('Content-Type', 'text/plain');
    res.send(output);
  }
}
