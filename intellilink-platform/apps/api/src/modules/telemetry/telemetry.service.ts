import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { AlertRuleEntity } from '../../entities/alert-rule.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { AppEventsGateway } from '../../websocket/events.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @InjectRepository(MetricSampleEntity) private metricRepo: Repository<MetricSampleEntity>,
    @InjectRepository(GatewayEntity) private gatewayRepo: Repository<GatewayEntity>,
    @InjectRepository(AlertEntity) private alertRepo: Repository<AlertEntity>,
    @InjectRepository(AlertRuleEntity) private alertRuleRepo: Repository<AlertRuleEntity>,
    @InjectRepository(IncidentEntity) private incidentRepo: Repository<IncidentEntity>,
    private wsGateway: AppEventsGateway,
  ) {}

  async ingestHeartbeat(data: { gatewayId: string; cpuPercent: number; memoryPercent: number; diskPercent: number; uptimeSeconds: number }) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.gatewayId);
    let gateway: GatewayEntity | null = null;
    try {
      if (isUuid) {
        gateway = await this.gatewayRepo.findOne({ where: { id: data.gatewayId } });
      } else {
        gateway = await this.gatewayRepo.findOne({
          where: [
            { hostname: data.gatewayId },
            { serialNumber: data.gatewayId },
          ],
        });
      }

      if (gateway) {
        await this.gatewayRepo.update(gateway.id, {
          lastHeartbeatAt: new Date(),
          status: 'ONLINE',
        });
      }
    } catch (err: any) {
      this.logger.warn(`Gateway lookup/update note: ${err?.message || err}`);
    }

    const sample = this.metricRepo.create({
      id: uuidv4(),
      sourceId: gateway ? gateway.id : data.gatewayId,
      sourceType: 'GATEWAY',
      metrics: {
        cpu: data.cpuPercent,
        memory: data.memoryPercent,
        disk: data.diskPercent,
        uptime: data.uptimeSeconds,
      },
      timestamp: new Date(),
    });
    await this.metricRepo.save(sample);

    this.wsGateway.broadcast('telemetry:heartbeat', data);
    await this.evaluateRules('GATEWAY', sample.sourceId, sample.metrics);
    return { status: 'acknowledged' };
  }

  async ingestMetrics(data: { sourceId: string; sourceType: string; metrics: Record<string, number> }) {
    const sample = this.metricRepo.create({
      id: uuidv4(),
      sourceId: data.sourceId,
      sourceType: data.sourceType,
      metrics: data.metrics,
      timestamp: new Date(),
    });
    await this.metricRepo.save(sample);

    this.wsGateway.broadcast('telemetry:metrics', data);
    await this.evaluateRules(data.sourceType, data.sourceId, data.metrics);
    return { status: 'ingested', sampleId: sample.id };
  }

  async getLatestMetrics(sourceId: string) {
    return this.metricRepo.findOne({
      where: { sourceId },
      order: { timestamp: 'DESC' },
    });
  }

  async getHistory(sourceId: string, limit = 50) {
    return this.metricRepo.find({
      where: { sourceId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getFabricOverview() {
    const totalSamples = await this.metricRepo.count();
    
    const recentWan = await this.metricRepo.find({
      where: { sourceType: 'WAN' },
      order: { timestamp: 'DESC' },
      take: 16,
    });

    const recentPop = await this.metricRepo.find({
      where: { sourceType: 'POP' },
      order: { timestamp: 'DESC' },
      take: 16,
    });

    const recentGw = await this.metricRepo.find({
      where: { sourceType: 'GATEWAY' },
      order: { timestamp: 'DESC' },
      take: 16,
    });

    const os = require('os');
    const cpus = os.cpus();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const loadAvg = os.loadavg();
    const networkInterfaces = os.networkInterfaces();

    return {
      totalSamples,
      recentWan,
      recentPop,
      recentGw,
      hostTelemetry: {
        cpuCount: cpus.length,
        cpuModel: cpus[0]?.model || 'Standard x86_64',
        loadAvg,
        memoryUsagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
        uptimeSeconds: Math.round(os.uptime()),
        networkInterfaces: Object.keys(networkInterfaces).map(iface => ({
          name: iface,
          addresses: networkInterfaces[iface]?.map((a: any) => a.address) || [],
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async evaluateRules(resourceType: string, resourceId: string, metrics: Record<string, number>) {
    try {
      const rules = await this.alertRuleRepo.find({ where: { resourceType, enabled: true } });
      for (const rule of rules) {
        const val = metrics[rule.metricName];
        if (val === undefined) continue;

        let triggered = false;
        if (rule.operator === '>' && val > rule.threshold) triggered = true;
        if (rule.operator === '>=' && val >= rule.threshold) triggered = true;
        if (rule.operator === '<' && val < rule.threshold) triggered = true;
        if (rule.operator === '<=' && val <= rule.threshold) triggered = true;
        if (rule.operator === '==' && val === rule.threshold) triggered = true;

        if (triggered) {
          const alert = this.alertRepo.create({
            id: uuidv4(),
            organizationId: rule.organizationId,
            tenantId: rule.tenantId,
            alertRuleId: rule.id,
            resourceType,
            resourceId,
            resourceName: `${resourceType}-${resourceId.slice(0, 8)}`,
            severity: rule.severity,
            status: 'OPEN',
            title: `Alert: ${rule.metricName} violated (${val} ${rule.operator} ${rule.threshold})`,
            description: `Automated alert triggered by telemetry evaluation for ${rule.metricName}`,
            metricName: rule.metricName,
            metricValue: val,
            threshold: rule.threshold,
          });
          const savedAlert = await this.alertRepo.save(alert);
          this.wsGateway.broadcast('alert:created', savedAlert);

          if (rule.severity === 'CRITICAL' || rule.severity === 'HIGH') {
            const inc = this.incidentRepo.create({
              id: uuidv4(),
              organizationId: rule.organizationId,
              tenantId: rule.tenantId,
              title: `Incident: High impact alert on ${resourceType}`,
              description: `Automated correlation: ${alert.title}`,
              status: 'OPEN',
              priority: rule.severity === 'CRITICAL' ? 'P1' : 'P2',
              startedAt: new Date(),
              detectedBy: 'SYSTEM',
              affectedSites: [resourceId],
            });
            const savedInc = await this.incidentRepo.save(inc);
            this.wsGateway.broadcast('incident:created', savedInc);
          }
        }
      }
    } catch (err) {
      this.logger.error('Error evaluating alert rules', err);
    }
  }
}
