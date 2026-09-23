import { v4 as uuidv4 } from "uuid";
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as Entities from '../entities';

import { getOrCreateMemoryDataSource } from '../database/in-memory-db';

export async function runSeed(externalDs?: DataSource) {
  let dataSource: DataSource;
  if (externalDs) {
    dataSource = externalDs;
  } else if (process.env.DATABASE_TYPE === 'memory') {
    dataSource = await getOrCreateMemoryDataSource();
  } else {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'intellilink',
      password: process.env.DATABASE_PASSWORD || 'intellilink_dev',
      database: process.env.DATABASE_NAME || 'intellilink',
      entities: Object.values(Entities),
      synchronize: true,
    });
    await dataSource.initialize();
  }
  console.log('🌱 Connected to database for seeding...');

  const orgRepo = dataSource.getRepository(Entities.OrganizationEntity);
  const userRepo = dataSource.getRepository(Entities.UserEntity);
  const tenantRepo = dataSource.getRepository(Entities.TenantEntity);
  const popRepo = dataSource.getRepository(Entities.PopEntity);
  const aggRepo = dataSource.getRepository(Entities.AggregatorEntity);
  const siteRepo = dataSource.getRepository(Entities.SiteEntity);
  const gwRepo = dataSource.getRepository(Entities.GatewayEntity);
  const wanRepo = dataSource.getRepository(Entities.WanLinkEntity);
  const tunnelRepo = dataSource.getRepository(Entities.TunnelEntity);
  const alertRuleRepo = dataSource.getRepository(Entities.AlertRuleEntity);
  const alertRepo = dataSource.getRepository(Entities.AlertEntity);
  const incRepo = dataSource.getRepository(Entities.IncidentEntity);

  // 1. Create Provider Organization
  let org = await orgRepo.findOne({ where: { slug: 'intellilink' } });
  if (!org) {
    org = orgRepo.create({
        id: uuidv4(),
      name: 'Intellilink Operations',
      slug: 'intellilink',
      type: 'PROVIDER',
      isActive: true,
    });
    await orgRepo.save(org);
  }

  // 2. Create Default Users
  const passHash = await bcrypt.hash('IntelliLink@2026', 10);
  const users = [
    { email: 'admin@intellilink.com', firstName: 'NOC', lastName: 'Admin', role: 'PROVIDER_ADMIN' },
    { email: 'operator@intellilink.com', firstName: 'Lead', lastName: 'Operator', role: 'NOC_OPERATOR' },
    { email: 'auditor@intellilink.com', firstName: 'Sec', lastName: 'Auditor', role: 'AUDITOR' },
  ];

  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(userRepo.create({
        id: uuidv4(),
        ...u,
        passwordHash: passHash,
        organizationId: org.id,
        isActive: true,
      }));
    }
  }

  // 3. Create 4 PoPs
  const popData = [
    { name: 'Mumbai Primary PoP', location: 'Navi Mumbai DataCenter', city: 'Mumbai', state: 'MH', lat: 19.0760, lng: 72.8777, isp: 'ISP Core West' },
    { name: 'Delhi NCR Governance PoP', location: 'Noida Tech Zone', city: 'Noida', state: 'UP', lat: 28.5355, lng: 77.3910, isp: 'ISP Core North' },
    { name: 'Bengaluru South Hub', location: 'Whitefield Carrier Hotel', city: 'Bengaluru', state: 'KA', lat: 12.9716, lng: 77.5946, isp: 'ISP Core South' },
    { name: 'Kolkata East PoP', location: 'Salt Lake Sector V', city: 'Kolkata', state: 'WB', lat: 22.5726, lng: 88.3639, isp: 'ISP Core East' },
  ];

  const createdPops: Entities.PopEntity[] = [];
  for (const p of popData) {
    let pop = await popRepo.findOne({ where: { name: p.name } });
    if (!pop) {
      pop = await popRepo.save(popRepo.create({
        id: uuidv4(),
        name: p.name,
        location: p.location,
        city: p.city,
        state: p.state,
        country: 'IN',
        latitude: p.lat,
        longitude: p.lng,
        ispName: p.isp,
        status: 'ONLINE',
        maxCapacityGbps: 40,
        maxTunnels: 10000,
      }));
    }
    createdPops.push(pop);
  }

  // 4. Create 8 Aggregators (2 per PoP)
  const createdAggs: Entities.AggregatorEntity[] = [];
  for (let i = 0; i < createdPops.length; i++) {
    const pop = createdPops[i];
    for (let j = 1; j <= 2; j++) {
      const hostname = `agg0${j}.${pop.city.toLowerCase()}.intellilink.net`;
      let agg = await aggRepo.findOne({ where: { hostname } });
      if (!agg) {
        agg = await aggRepo.save(aggRepo.create({
        id: uuidv4(),
          popId: pop.id,
          hostname,
          ipAddress: `10.250.${i + 1}.${10 + j}`,
          version: 'v3.4.1-lts',
          status: 'ONLINE',
          maxTunnels: 5000,
          maxBandwidthMbps: 20000,
        }));
      }
      createdAggs.push(agg);
    }
  }

  // 5. Create 10 Tenants
  const tenantTypes = ['BANKING', 'GOVERNMENT', 'ENTERPRISE', 'EDUCATION', 'HEALTHCARE', 'ENTERPRISE', 'BANKING', 'GOVERNMENT', 'ENTERPRISE', 'HEALTHCARE'];
  const tenantNames = [
    'State Bank Network', 'National Informatics Grid', 'Apex Logistics Corp',
    'TechVarsity Campuses', 'Apollo Health Systems', 'Tata Energy Solutions',
    'HDFC Regional Link', 'Railways Freight Comm', 'Reliance Metro Hubs', 'MaxCare Diagnostic Net'
  ];

  const createdTenants: Entities.TenantEntity[] = [];
  for (let i = 0; i < 10; i++) {
    const slug = `tenant-${i + 1}-${tenantNames[i].toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    let t = await tenantRepo.findOne({ where: { slug } });
    if (!t) {
      t = await tenantRepo.save(tenantRepo.create({
        id: uuidv4(),
        organizationId: org.id,
        name: tenantNames[i],
        slug,
        type: tenantTypes[i],
        status: 'ACTIVE',
        contactEmail: `admin@${slug.slice(0, 15)}.com`,
        maxSites: 100,
        maxGateways: 200,
      }));

      // Tenant user
      await userRepo.save(userRepo.create({
        id: uuidv4(),
        email: `tenant${i + 1}@intellilink.com`,
        firstName: tenantNames[i].split(' ')[0],
        lastName: 'Admin',
        role: 'TENANT_ADMIN',
        organizationId: org.id,
        tenantId: t.id,
        passwordHash: passHash,
        isActive: true,
      }));
    }
    createdTenants.push(t);
  }

  // 6. Create 50 Sites (5 per tenant)
  const createdSites: Entities.SiteEntity[] = [];
  const cities = ['Bhopal', 'Indore', 'Jaipur', 'Ahmedabad', 'Pune', 'Lucknow', 'Chandigarh', 'Nagpur', 'Patna', 'Kochi'];
  
  for (let tIdx = 0; tIdx < createdTenants.length; tIdx++) {
    const tenant = createdTenants[tIdx];
    for (let sIdx = 1; sIdx <= 5; sIdx++) {
      const city = cities[(tIdx + sIdx) % cities.length];
      const name = `${tenant.name.split(' ')[0]} - ${city} Branch ${sIdx}`;
      let site = await siteRepo.findOne({ where: { name } });
      if (!site) {
        const assignedPop = createdPops[(tIdx + sIdx) % createdPops.length];
        site = await siteRepo.save(siteRepo.create({
        id: uuidv4(),
          tenantId: tenant.id,
          organizationId: org.id,
          popId: assignedPop.id,
          name,
          address: `${100 + sIdx} Tech Park, Ring Road`,
          city,
          state: 'Central',
          country: 'IN',
          latitude: 23.2599 + (tIdx * 0.1),
          longitude: 77.4126 + (sIdx * 0.1),
          status: (tIdx === 1 && sIdx === 2) ? 'DEGRADED' : 'ONLINE',
          subnetCidr: `10.${100 + tIdx}.${sIdx}.0/24`,
        }));
      }
      createdSites.push(site);
    }
  }

  // 7. Create 70 Gateways
  const createdGateways: Entities.GatewayEntity[] = [];
  for (let i = 0; i < 70; i++) {
    const site = createdSites[i % createdSites.length];
    const hostname = `gw-${site.city.toLowerCase()}-${String(i + 1).padStart(3, '0')}.edge`;
    let gw = await gwRepo.findOne({ where: { hostname } });
    if (!gw) {
      gw = await gwRepo.save(gwRepo.create({
        id: uuidv4(),
        siteId: site.id,
        tenantId: site.tenantId,
        organizationId: org.id,
        hostname,
        model: 'IntelliEdge-X800',
        firmwareVersion: 'v2.12.0',
        serialNumber: `SN-2026-X8-${1000 + i}`,
        status: (i === 12) ? 'DEGRADED' : 'ONLINE',
        lastHeartbeatAt: new Date(),
      }));
    }
    createdGateways.push(gw);
  }

  // 8. Create 150 WAN Links (2-3 per gateway)
  const wanTypes = ['FIBER', 'SATELLITE', 'BROADBAND', '5G'];
  const createdWans: Entities.WanLinkEntity[] = [];
  for (let i = 0; i < 150; i++) {
    const gw = createdGateways[i % createdGateways.length];
    const type = wanTypes[i % wanTypes.length];
    const isPrimary = (i % 2 === 0);
    const name = `${gw.hostname}-WAN-${type.toLowerCase()}`;
    let wan = await wanRepo.findOne({ where: { name } });
    if (!wan) {
      wan = await wanRepo.save(wanRepo.create({
        id: uuidv4(),
        gatewayId: gw.id,
        siteId: gw.siteId,
        tenantId: gw.tenantId,
        organizationId: org.id,
        name,
        type,
        providerName: type === 'SATELLITE' ? 'Starlink Aviation' : 'Tata Communications',
        bandwidthUpMbps: type === 'FIBER' ? 500 : 100,
        bandwidthDownMbps: type === 'FIBER' ? 500 : 250,
        status: (i === 7) ? 'DEGRADED' : 'ACTIVE',
        isPrimary,
        priority: isPrimary ? 1 : 2,
      }));
    }
    createdWans.push(wan);
  }

  // 9. Create 100 Tunnels
  for (let i = 0; i < 100; i++) {
    const gw = createdGateways[i % createdGateways.length];
    const wan = createdWans[i % createdWans.length];
    const agg = createdAggs[i % createdAggs.length];
    const localEndpoint = `10.${150 + (i % 50)}.1.2:51820`;
    const remoteEndpoint = `${agg.ipAddress}:51820`;

    let tunnel = await tunnelRepo.findOne({ where: { localEndpoint } });
    if (!tunnel) {
      await tunnelRepo.save(tunnelRepo.create({
        id: uuidv4(),
        siteId: gw.siteId,
        tenantId: gw.tenantId,
        organizationId: org.id,
        gatewayId: gw.id,
        aggregatorId: agg.id,
        wanLinkId: wan.id,
        protocol: 'WIREGUARD',
        status: (i === 5) ? 'DEGRADED' : 'UP',
        localEndpoint,
        remoteEndpoint,
        localSubnet: `10.200.${i + 1}.0/30`,
        remoteSubnet: `10.200.${i + 1}.2/30`,
      }));
    }
  }

  // 10. Create Default Alert Rules
  const defaultRules = [
    { name: 'High Packet Loss Alert', resourceType: 'WAN', metricName: 'packetLossPercent', operator: '>', threshold: 5, severity: 'HIGH' },
    { name: 'Critical Latency Alert', resourceType: 'WAN', metricName: 'latencyMs', operator: '>', threshold: 250, severity: 'CRITICAL' },
    { name: 'Gateway High CPU Alert', resourceType: 'GATEWAY', metricName: 'cpu', operator: '>', threshold: 85, severity: 'WARNING' },
    { name: 'PoP Throughput Alert', resourceType: 'POP', metricName: 'utilizationPercent', operator: '>', threshold: 80, severity: 'WARNING' },
  ];

  for (const r of defaultRules) {
    let rule = await alertRuleRepo.findOne({ where: { name: r.name } });
    if (!rule) {
      await alertRuleRepo.save(alertRuleRepo.create({
        id: uuidv4(),
        organizationId: org.id,
        name: r.name,
        description: `Triggered when ${r.metricName} ${r.operator} ${r.threshold}`,
        resourceType: r.resourceType,
        metricName: r.metricName,
        operator: r.operator,
        threshold: r.threshold,
        durationSeconds: 30,
        severity: r.severity,
        enabled: true,
        notificationChannels: ['IN_APP', 'EMAIL'],
      }));
    }
  }

  console.log('✅ DEMO SEED DATA COMPLETE:');
  console.log(' - 1 Organization (Intellilink)');
  console.log(' - 4 Core ISP PoPs');
  console.log(' - 8 Aggregators');
  console.log(' - 10 Multi-Tenant Organizations');
  console.log(' - 50 Distributed Branch Sites');
  console.log(' - 70 Edge Gateways');
  console.log(' - 150 WAN Links (Fiber/Starlink/5G)');
  console.log(' - 100 WireGuard Encrypted Tunnels');
  console.log(' - Credentials: admin@intellilink.com / IntelliLink@2026');

  if (!externalDs) {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
