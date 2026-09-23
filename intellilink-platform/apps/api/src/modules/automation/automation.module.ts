import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationRuleEntity } from '../../entities/automation-rule.entity';
import { AutomationRunEntity } from '../../entities/automation-run.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutomationRuleEntity,
      AutomationRunEntity,
      WanLinkEntity,
      GatewayEntity,
      AuditLogEntity,
    ]),
  ],
  providers: [AutomationService],
  controllers: [AutomationController],
  exports: [AutomationService],
})
export class AutomationModule {}
