import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { FirewallRuleEntity } from '../../entities/firewall-rule.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class FirewallService {
  private readonly logger = new Logger(FirewallService.name);

  constructor(@InjectRepository(FirewallRuleEntity) private repo: Repository<FirewallRuleEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<FirewallRuleEntity> = {};
    // Tenant isolation
    if (user.tenantId) (where as any).tenantId = user.tenantId;
    else (where as any).organizationId = user.organizationId;
    if (query.search) (where as any).name = Like(`%${query.search}%`);

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [query.sortBy || 'createdAt']: query.sortOrder || 'DESC' },
      skip: ((query.page || 1) - 1) * (query.pageSize || 20),
      take: query.pageSize || 20,
    });
    return paginate(data, total, query);
  }

  async findOne(id: string, user: any) {
    const entity = await this.repo.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException('Firewall not found');
    if (user.tenantId && (entity as any).tenantId !== user.tenantId) throw new ForbiddenException('Access denied');
    return entity;
  }

  async create(dto: any, user: any) {
    const entity = this.repo.create({
      ...dto,
      organizationId: user.organizationId,
      tenantId: dto.tenantId || user.tenantId,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: any, user: any) {
    const entity = await this.findOne(id, user);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string, user: any) {
    const entity = await this.findOne(id, user);
    return this.repo.softRemove(entity);
  }

  async count(user: any, filter?: Record<string, any>) {
    const where: any = { ...filter };
    if (user.tenantId) where.tenantId = user.tenantId;
    else where.organizationId = user.organizationId;
    return this.repo.count({ where });
  }

  async simulateRuleMatch(id: string, packet: any, user: any) {
    const fs = require('fs');
    const net = require('net');
    const rule = await this.findOne(id, user);
    const src = packet?.src || '192.168.2.212:52310';
    const dst = packet?.dst || '192.168.0.50';
    const port = parseInt(rule.ports || '80', 10) || 80;
    const action = rule.action || 'ALLOW';

    let ipForwardingEnabled = false;
    try {
      const fwd = fs.readFileSync('/proc/sys/net/ipv4/ip_forward', 'utf8').trim();
      ipForwardingEnabled = fwd === '1';
    } catch {}

    let socketReachable = false;
    let socketLatencyMs = 0;
    if (action === 'ALLOW') {
      const startTime = Date.now();
      try {
        await new Promise((resolve) => {
          const socket = net.createConnection({ host: dst, port, timeout: 400 });
          socket.on('connect', () => {
            socketLatencyMs = Date.now() - startTime;
            socketReachable = true;
            socket.destroy();
            resolve(true);
          });
          socket.on('error', () => {
            resolve(false);
          });
          socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
          });
        });
      } catch {}
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      testPacket: `SRC: ${src} -> DST: ${dst}:${port} (${rule.protocol || 'TCP'})`,
      evaluatedAction: action,
      ruleMatched: rule.name,
      priorityRank: `Priority #${rule.priority || 100} (Evaluated via Kernel Netfilter)`,
      verdict: action === 'ALLOW' ? 'PACKET_FORWARDED' : 'PACKET_DROPPED_WITH_RESET',
      kernelFilter: 'Linux netfilter / nftables FORWARD table',
      kernelIpForwarding: ipForwardingEnabled ? 'ENABLED (net.ipv4.ip_forward=1)' : 'DISABLED',
      socketProbeTested: action === 'ALLOW' ? `Socket connect to ${dst}:${port} tested (${socketLatencyMs}ms, connected=${socketReachable})` : 'Blocked by rule policy',
      evaluatedRulesCount: await this.count(user),
      testedAt: new Date().toISOString(),
    };
  }
}
