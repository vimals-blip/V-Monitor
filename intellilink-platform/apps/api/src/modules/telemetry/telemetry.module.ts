import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { AlertRuleEntity } from '../../entities/alert-rule.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MetricSampleEntity,
      GatewayEntity,
      AlertEntity,
      AlertRuleEntity,
      IncidentEntity,
    ]),
    WebsocketModule,
  ],
  providers: [TelemetryService],
  controllers: [TelemetryController],
  exports: [TelemetryService],
})
export class TelemetryModule {}
