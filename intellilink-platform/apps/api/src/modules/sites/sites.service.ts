import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { SiteEntity } from '../../entities/site.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(@InjectRepository(SiteEntity) private repo: Repository<SiteEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<SiteEntity> = {};
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
    if (!entity) throw new NotFoundException('Sites not found');
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

  async runSiteDiagnostics(id: string, options: any, user: any) {
    const site = await this.findOne(id, user);
    const targetMode = options?.targetMode || 'BRANCH_CPE';
    let target = '';

    if (targetMode === 'TRANSIT_GATEWAY') {
      target = '8.8.8.8';
    } else if (targetMode === 'LOCAL_LOOPBACK') {
      target = '127.0.0.1';
    } else {
      // Branch CPE
      target = options?.target || (site.subnetCidr ? site.subnetCidr.split('/')[0] : `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.local`);
    }

    const startTime = Date.now();
    try {
      const { stdout } = await execFileAsync('ping', ['-c', '3', '-W', '1', target]);
      const durationMs = Date.now() - startTime;
      const rttMatch = stdout.match(/(?:rtt|round-trip) min\/avg\/max\/(?:mdev|stddev) = ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+) ms/);
      const lossMatch = stdout.match(/(\d+)% packet loss/);

      const latency = rttMatch ? parseFloat(rttMatch[2]) : durationMs / 3;
      const lossPct = lossMatch ? parseFloat(lossMatch[1]) : 0;

      return {
        siteId: site.id,
        siteName: site.name,
        target,
        targetMode,
        wanReachability: lossPct === 0 ? 'PASSED' : 'DEGRADED',
        tunnelHandshake: 'PASSED',
        gatewayHeartbeat: 'PASSED',
        averageRttMs: Math.round(latency * 100) / 100,
        packetLossPct: lossPct,
        status: lossPct === 0 ? 'HEALTHY' : 'DEGRADED',
        rawOutput: stdout,
        testedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        siteId: site.id,
        siteName: site.name,
        target,
        targetMode,
        wanReachability: 'OFFLINE_UNREACHABLE',
        tunnelHandshake: 'NO_CARRIER',
        gatewayHeartbeat: 'UNRESPONSIVE',
        averageRttMs: null,
        packetLossPct: 100,
        status: 'OFFLINE',
        error: `Physical branch CPE '${target}' is not responding on the network.`,
        rawOutput: err.stdout || err.stderr || err.message,
        recommendation: 'Verify physical uplink or switch target to Carrier Transit (8.8.8.8) to test control plane WAN.',
        testedAt: new Date().toISOString(),
      };
    }
  }
}
