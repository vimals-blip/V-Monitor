import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkDiscoveryService } from './network-discovery.service';
import { NetworkDiscoveryController } from './network-discovery.controller';
import { GatewayEntity } from '../../entities/gateway.entity';
import { SiteEntity } from '../../entities/site.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { TenantEntity } from '../../entities/tenant.entity';
import { OrganizationEntity } from '../../entities/organization.entity';
import { PopEntity } from '../../entities/pop.entity';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { RouteEntity } from '../../entities/route.entity';
import { FirewallRuleEntity } from '../../entities/firewall-rule.entity';
import { NatRuleEntity } from '../../entities/nat-rule.entity';
import { PolicyEntity } from '../../entities/policy.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { AutomationRuleEntity } from '../../entities/automation-rule.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { AlertRuleEntity } from '../../entities/alert-rule.entity';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GatewayEntity,
      SiteEntity,
      WanLinkEntity,
      MetricSampleEntity,
      TenantEntity,
      OrganizationEntity,
      PopEntity,
      AggregatorEntity,
      TunnelEntity,
      RouteEntity,
      FirewallRuleEntity,
      NatRuleEntity,
      PolicyEntity,
      IncidentEntity,
      AutomationRuleEntity,
      AlertEntity,
      AlertRuleEntity,
    ]),
    WebsocketModule,
  ],
  controllers: [NetworkDiscoveryController],
  providers: [NetworkDiscoveryService],
  exports: [NetworkDiscoveryService],
})
export class NetworkDiscoveryModule {}
