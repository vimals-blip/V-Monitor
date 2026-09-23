import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../../entities/tenant.entity';
import { SiteEntity } from '../../entities/site.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { PopEntity } from '../../entities/pop.entity';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      SiteEntity,
      GatewayEntity,
      PopEntity,
      AggregatorEntity,
      TunnelEntity,
      AlertEntity,
      IncidentEntity,
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
