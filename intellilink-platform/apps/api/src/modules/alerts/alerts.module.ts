import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEntity } from '../../entities/alert.entity';
import { AlertRuleEntity } from '../../entities/alert-rule.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlertEntity,
      AlertRuleEntity,
      GatewayEntity,
      WanLinkEntity,
    ]),
    WebsocketModule,
  ],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
