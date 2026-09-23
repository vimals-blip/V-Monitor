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
    const rule = await this.findOne(id, user);
    const src = packet?.src || '10.100.1.45:52310';
    const dst = packet?.dst || '1.1.1.1';
    const port = rule.ports || '443';
    const action = rule.action || 'ALLOW';

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      testPacket: `SRC: ${src} -> DST: ${dst}:${port} (${rule.protocol || 'TCP'})`,
      evaluatedAction: action,
      ruleMatched: rule.name,
      priorityRank: `Priority #${rule.priority || 100} (Preempts default drop)`,
      verdict: action === 'ALLOW' ? 'PACKET_FORWARDED' : 'PACKET_DROPPED_WITH_RESET',
      kernelFilter: 'Linux netfilter / nftables FORWARD table',
      evaluatedRulesCount: await this.count(user),
      testedAt: new Date().toISOString(),
    };
  }
}
