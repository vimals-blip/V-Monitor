import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../../entities/tenant.entity';
import { SiteEntity } from '../../entities/site.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { PopEntity } from '../../entities/pop.entity';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { IncidentEntity } from '../../entities/incident.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(TenantEntity) private tenantRepo: Repository<TenantEntity>,
    @InjectRepository(SiteEntity) private siteRepo: Repository<SiteEntity>,
    @InjectRepository(GatewayEntity) private gatewayRepo: Repository<GatewayEntity>,
    @InjectRepository(PopEntity) private popRepo: Repository<PopEntity>,
    @InjectRepository(AggregatorEntity) private aggregatorRepo: Repository<AggregatorEntity>,
    @InjectRepository(TunnelEntity) private tunnelRepo: Repository<TunnelEntity>,
    @InjectRepository(AlertEntity) private alertRepo: Repository<AlertEntity>,
    @InjectRepository(IncidentEntity) private incidentRepo: Repository<IncidentEntity>,
  ) {}

  async getSummary(user: any) {
    const isTenant = !!user.tenantId;
    const filter = isTenant ? { tenantId: user.tenantId } : { organizationId: user.organizationId };

    const [tenantCount, siteCount, gatewayCount, popCount, aggregatorCount, tunnelCount] = await Promise.all([
      isTenant ? 1 : this.tenantRepo.count({ where: { organizationId: user.organizationId } }),
      this.siteRepo.count({ where: filter }),
      this.gatewayRepo.count({ where: filter }),
      this.popRepo.count(),
      this.aggregatorRepo.count(),
      this.tunnelRepo.count({ where: filter }),
    ]);

    const onlineSites = await this.siteRepo.count({ where: { ...filter, status: 'ONLINE' } });
    const degradedSites = await this.siteRepo.count({ where: { ...filter, status: 'DEGRADED' } });
    const offlineSites = await this.siteRepo.count({ where: { ...filter, status: 'OFFLINE' } });

    const onlineGateways = await this.gatewayRepo.count({ where: { ...filter, status: 'ONLINE' } });
    const degradedGateways = await this.gatewayRepo.count({ where: { ...filter, status: 'DEGRADED' } });
    const offlineGateways = await this.gatewayRepo.count({ where: { ...filter, status: 'OFFLINE' } });

    const openAlerts = await this.alertRepo.count({ where: { ...filter, status: 'OPEN' } });
    const criticalIncidents = await this.incidentRepo.count({ where: { ...filter, status: 'OPEN', priority: 'P1' } });

    return {
      tenants: tenantCount,
      sites: siteCount,
      gateways: gatewayCount,
      onlineGateways,
      degradedGateways,
      offlineGateways,
      pops: popCount,
      aggregators: aggregatorCount,
      activeTunnels: tunnelCount,
      onlineSites,
      degradedSites,
      offlineSites,
      openAlerts,
      criticalIncidents,
      totalTrafficMbps: 1420.5,
      systemHealth: 'OPERATIONAL',
    };
  }
}
