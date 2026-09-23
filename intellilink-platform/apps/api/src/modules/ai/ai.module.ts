import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSessionEntity } from '../../entities/ai-session.entity';
import { AiMessageEntity } from '../../entities/ai-message.entity';
import { SiteEntity } from '../../entities/site.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { PopEntity } from '../../entities/pop.entity';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { PolicyEntity } from '../../entities/policy.entity';
import { AutomationRuleEntity } from '../../entities/automation-rule.entity';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { DiagnosticsModule } from '../diagnostics/diagnostics.module';
import { AiService } from './ai.service';
import { RcaEngineService } from './rca-engine.service';
import { AnomalyService } from './anomaly.service';
import { AiController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiSessionEntity,
      AiMessageEntity,
      SiteEntity,
      GatewayEntity,
      WanLinkEntity,
      PopEntity,
      AggregatorEntity,
      TunnelEntity,
      AlertEntity,
      IncidentEntity,
      PolicyEntity,
      AutomationRuleEntity,
      MetricSampleEntity,
    ]),
    DiagnosticsModule,
  ],
  controllers: [AiController],
  providers: [AiService, RcaEngineService, AnomalyService],
  exports: [AiService, RcaEngineService, AnomalyService],
})
export class AiModule {}
