import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RcaEngineService } from './rca-engine.service';
import { AnomalyService } from './anomaly.service';
import { ChatRequestDto, RcaRequestDto, AnomalyDetectDto } from './ai.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AIOps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rcaService: RcaEngineService,
    private readonly anomalyService: AnomalyService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send natural language query to AIOps NOC Assistant' })
  chat(@Body() dto: ChatRequestDto, @CurrentUser() user: any) {
    return this.aiService.chat(dto.message, dto.sessionId, user);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get recent AIOps chat sessions' })
  getSessions(@CurrentUser() user: any) {
    return this.aiService.getSessions(user);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get conversation history for a session' })
  getMessages(@Param('id') id: string) {
    return this.aiService.getMessages(id);
  }

  @Post('rca')
  @ApiOperation({ summary: 'Execute Automated Root Cause Analysis (RCA)' })
  analyzeRca(@Body() dto: RcaRequestDto, @CurrentUser() user: any) {
    return this.rcaService.analyze(dto.targetId, dto.targetType, user);
  }

  @Post('anomaly/detect')
  @ApiOperation({ summary: 'Execute Statistical Telemetry Anomaly Detection (Z-Score)' })
  detectAnomalies(@Body() dto: AnomalyDetectDto) {
    return this.anomalyService.detect(dto);
  }
}
