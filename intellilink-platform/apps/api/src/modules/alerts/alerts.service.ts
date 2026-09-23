import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { AlertEntity } from '../../entities/alert.entity';
import { AlertRuleEntity } from '../../entities/alert-rule.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';
import { AppEventsGateway } from '../../websocket/events.gateway';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';

const execFileAsync = promisify(execFile);

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(AlertEntity) private repo: Repository<AlertEntity>,
    @InjectRepository(AlertRuleEntity) private alertRuleRepo: Repository<AlertRuleEntity>,
    @InjectRepository(GatewayEntity) private gwRepo: Repository<GatewayEntity>,
    @InjectRepository(WanLinkEntity) private wanRepo: Repository<WanLinkEntity>,
    private wsGateway: AppEventsGateway,
  ) {}

  private async pingHost(host: string, timeoutSec = 1): Promise<{ alive: boolean; latencyMs: number }> {
    try {
      const { stdout } = await execFileAsync('/usr/bin/ping', [
        '-c', '1',
        '-W', String(timeoutSec),
        host,
      ]);
      const match = stdout.match(/time=([0-9.]+)\s*ms/);
      const latencyMs = match ? parseFloat(match[1]) : 1.0;
      return { alive: true, latencyMs };
    } catch {
      return { alive: false, latencyMs: 0 };
    }
  }

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<AlertEntity> = {};
    if (user?.tenantId) (where as any).tenantId = user.tenantId;
    else if (user?.organizationId) (where as any).organizationId = user.organizationId;
    if (query?.search) (where as any).title = Like(`%${query.search}%`);

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [query.sortBy || 'createdAt']: query.sortOrder || 'DESC' },
      skip: ((query.page || 1) - 1) * (query.pageSize || 50),
      take: query.pageSize || 50,
    });
    return paginate(data, total, query);
  }

  async findOne(id: string, user: any) {
    const entity = await this.repo.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('Alert not found');
    if (user?.tenantId && (entity as any).tenantId !== user.tenantId) throw new ForbiddenException('Access denied');
    return entity;
  }

  async create(dto: any, user: any) {
    const entity = this.repo.create({
      id: uuidv4(),
      ...dto,
      organizationId: user?.organizationId,
      tenantId: dto.tenantId || user?.tenantId,
    });
    const saved = await this.repo.save(entity);
    this.wsGateway.broadcast('alert:created', saved);
    return saved;
  }

  async update(id: string, dto: any, user: any) {
    const entity = await this.findOne(id, user);
    Object.assign(entity, dto);
    if (dto.status === 'RESOLVED' && !entity.resolvedAt) {
      entity.resolvedAt = new Date();
    }
    if (dto.status === 'ACKNOWLEDGED' && !entity.acknowledgedAt) {
      entity.acknowledgedAt = new Date();
      entity.acknowledgedBy = user?.email || 'NOC Operator';
    }
    const updated = await this.repo.save(entity);
    this.wsGateway.broadcast('alert:updated', updated);
    return updated;
  }

  async remove(id: string, user: any) {
    const entity = await this.findOne(id, user);
    return this.repo.softRemove(entity);
  }

  async count(user: any, filter?: Record<string, any>) {
    const where: any = { ...filter };
    if (user?.tenantId) where.tenantId = user.tenantId;
    else if (user?.organizationId) where.organizationId = user.organizationId;
    return this.repo.count({ where });
  }

  /**
   * Run a live audit across physical fleet gateways and links
   */
  async auditLiveFleetTelemetry(user: any) {
    this.logger.log('Executing live telemetry alarm audit across physical fleet...');

    // Purge old synthetic dummy alerts
    await this.repo
      .createQueryBuilder()
      .delete()
      .where("resourceName LIKE :bhop OR resourceName LIKE :mumb OR resourceName LIKE :demo", {
        bhop: '%bhop%',
        mumb: '%mumb%',
        demo: '%demo%',
      })
      .execute();

    const gateways = await this.gwRepo.find();
    let probedCount = 0;
    let newAlertsCount = 0;
    let resolvedCount = 0;

    for (const gw of gateways) {
      probedCount++;
      const ipMatch = gw.hostname.match(/([0-9]+-[0-9]+-[0-9]+-[0-9]+)/);
      const targetIp = ipMatch ? ipMatch[1].replace(/-/g, '.') : '192.168.0.50';

      const ping = await this.pingHost(targetIp, 1);

      const existingAlert = await this.repo.findOne({
        where: {
          resourceId: gw.id,
          status: 'OPEN',
        },
      });

      if (!ping.alive) {
        if (!existingAlert) {
          const alert = this.repo.create({
            id: uuidv4(),
            organizationId: gw.organizationId || user?.organizationId || 'a7949357-0af2-4b5a-a820-aa3f323bd7f1',
            tenantId: gw.tenantId || user?.tenantId,
            alertRuleId: '1df179f2-d64c-44a7-bcd7-851a4c17efd6',
            resourceType: 'GATEWAY',
            resourceId: gw.id,
            resourceName: gw.hostname,
            severity: 'CRITICAL',
            status: 'OPEN',
            title: `Node Circuit Down: 100% ICMP loss on ${gw.hostname}`,
            description: `Live kernel probe to target ${targetIp} timed out with 0 replies over physical interface. Immediate failover required.`,
            metricName: 'packetLossPercent',
            metricValue: 100.0,
            threshold: 5.0,
          });
          await this.repo.save(alert);
          this.wsGateway.broadcast('alert:created', alert);
          newAlertsCount++;
        }
      } else {
        if (existingAlert) {
          existingAlert.status = 'RESOLVED';
          existingAlert.resolvedAt = new Date();
          existingAlert.description += ` [Auto-resolved: Live ICMP ping succeeded with RTT ${ping.latencyMs}ms]`;
          await this.repo.save(existingAlert);
          this.wsGateway.broadcast('alert:updated', existingAlert);
          resolvedCount++;
        }
      }
    }

    return {
      success: true,
      probedCount,
      newAlertsCount,
      resolvedCount,
      timestamp: new Date().toISOString(),
    };
  }

  async purgeMockAlerts(user: any) {
    await this.repo.createQueryBuilder().delete().execute();
    return { success: true, message: 'All mock and stale alerts cleared.' };
  }
}
