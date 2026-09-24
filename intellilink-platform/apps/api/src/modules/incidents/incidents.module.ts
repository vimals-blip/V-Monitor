import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentEntity } from '../../entities/incident.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentEntity,
      AlertEntity,
      GatewayEntity,
      AuditLogEntity,
    ]),
    WebsocketModule,
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}
