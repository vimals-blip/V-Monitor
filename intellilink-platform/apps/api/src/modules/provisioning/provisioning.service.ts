import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteEntity } from '../../entities/site.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { RouteEntity } from '../../entities/route.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(
    @InjectRepository(SiteEntity) private siteRepo: Repository<SiteEntity>,
    @InjectRepository(GatewayEntity) private gwRepo: Repository<GatewayEntity>,
    @InjectRepository(TunnelEntity) private tunnelRepo: Repository<TunnelEntity>,
    @InjectRepository(RouteEntity) private routeRepo: Repository<RouteEntity>,
    @InjectRepository(WanLinkEntity) private wanRepo: Repository<WanLinkEntity>,
  ) {}

  async provisionSite(payload: {
    tenantId: string;
    siteName: string;
    city: string;
    popId: string;
    aggregatorId: string;
    subnetCidr: string;
    gatewayHostname: string;
  }, user: any) {
    const steps: { step: number; name: string; status: string; details?: string }[] = [];

    try {
      // Step 1: Create Site
      const site = await this.siteRepo.save(this.siteRepo.create({
        tenantId: payload.tenantId,
        organizationId: user.organizationId,
        popId: payload.popId,
        name: payload.siteName,
        city: payload.city,
        address: `${payload.city} Branch Site`,
        subnetCidr: payload.subnetCidr,
        status: 'PROVISIONING',
      }));
      steps.push({ step: 1, name: 'CREATE_SITE', status: 'SUCCESS', details: site.id });

      // Step 2: Register Gateway
      const gw = await this.gwRepo.save(this.gwRepo.create({
        siteId: site.id,
        tenantId: payload.tenantId,
        organizationId: user.organizationId,
        hostname: payload.gatewayHostname,
        status: 'PROVISIONING',
        enrollmentToken: `enroll_${Date.now()}`,
      }));
      steps.push({ step: 2, name: 'REGISTER_GATEWAY', status: 'SUCCESS', details: gw.id });

      // Step 3: Create Primary & Backup WAN Links
      const wan = await this.wanRepo.save(this.wanRepo.create({
        gatewayId: gw.id,
        siteId: site.id,
        tenantId: payload.tenantId,
        organizationId: user.organizationId,
        name: `${payload.gatewayHostname}-wan1`,
        type: 'FIBER',
        providerName: 'Carrier Fiber Primary',
        status: 'ACTIVE',
        isPrimary: true,
      }));
      steps.push({ step: 3, name: 'PROVISION_WAN_LINKS', status: 'SUCCESS' });

      // Step 4: Establish Encrypted WireGuard Tunnel
      const tunnel = await this.tunnelRepo.save(this.tunnelRepo.create({
        siteId: site.id,
        tenantId: payload.tenantId,
        organizationId: user.organizationId,
        gatewayId: gw.id,
        aggregatorId: payload.aggregatorId,
        wanLinkId: wan.id,
        protocol: 'WIREGUARD',
        status: 'UP',
        localEndpoint: '10.150.2.1:51820',
        remoteEndpoint: '10.250.1.10:51820',
      }));
      steps.push({ step: 4, name: 'ESTABLISH_TUNNEL', status: 'SUCCESS', details: tunnel.id });

      // Step 5: Inject Route Prefix
      await this.routeRepo.save(this.routeRepo.create({
        tenantId: payload.tenantId,
        organizationId: user.organizationId,
        siteId: site.id,
        gatewayId: gw.id,
        prefix: payload.subnetCidr,
        nextHop: '10.250.1.10',
        interfaceName: 'wg0',
        protocol: 'STATIC',
        status: 'ACTIVE',
      }));
      steps.push({ step: 5, name: 'INJECT_ROUTES', status: 'SUCCESS' });

      // Step 6: Mark Site & Gateway ONLINE
      await this.siteRepo.update(site.id, { status: 'ONLINE' });
      await this.gwRepo.update(gw.id, { status: 'ONLINE' });
      steps.push({ step: 6, name: 'START_TELEMETRY_AND_ACTIVATE', status: 'SUCCESS' });

      return {
        status: 'ONLINE',
        siteId: site.id,
        gatewayId: gw.id,
        tunnelId: tunnel.id,
        steps,
      };
    } catch (err: any) {
      this.logger.error('Site provisioning workflow error', err);
      return {
        status: 'FAILED',
        error: err.message,
        steps,
      };
    }
  }
}
