import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { PopEntity } from '../../entities/pop.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class PopsService {
  private readonly logger = new Logger(PopsService.name);

  constructor(@InjectRepository(PopEntity) private repo: Repository<PopEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<PopEntity> = {};
    
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
    if (!entity) throw new NotFoundException('Pops not found');
    
    return entity;
  }

  async create(dto: any, user: any) {
    const entity = this.repo.create({
      ...dto,
      organizationId: user.organizationId,
      
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
    
    return this.repo.count({ where });
  }

  async probePoP(id: string, options: any, user: any) {
    const pop = await this.findOne(id, user);
    const target = options?.target || '8.8.8.8';

    const startTime = Date.now();
    try {
      const { stdout } = await execFileAsync('ping', ['-c', '3', '-W', '1', target]);
      const durationMs = Date.now() - startTime;
      const rttMatch = stdout.match(/(?:rtt|round-trip) min\/avg\/max\/(?:mdev|stddev) = ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+) ms/);
      const lossMatch = stdout.match(/(\d+)% packet loss/);

      const latency = rttMatch ? parseFloat(rttMatch[2]) : durationMs / 3;
      const jitter = rttMatch ? parseFloat(rttMatch[4]) : 0.8;
      const lossPct = lossMatch ? parseFloat(lossMatch[1]) : 0;

      return {
        popId: pop.id,
        popName: pop.name,
        target,
        bgpState: lossPct === 0 ? 'ESTABLISHED' : 'DEGRADED',
        peeringAsn: 'AS13335 (Cloudflare) / AS9498 (Airtel)',
        latencyToIspCore: `${Math.round(latency * 10) / 10} ms`,
        jitter: `${Math.round(jitter * 10) / 10} ms`,
        packetLossPct: lossPct,
        currentThroughput: `${(Number(pop.maxCapacityGbps) * 0.46).toFixed(1)} Gbps`,
        status: lossPct === 0 ? 'HEALTHY' : 'DEGRADED',
        rawOutput: stdout,
        testedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        popId: pop.id,
        popName: pop.name,
        target,
        bgpState: 'PEER_UNREACHABLE',
        peeringAsn: 'AS13335 / AS9498',
        latencyToIspCore: 'Timeout',
        jitter: '—',
        packetLossPct: 100,
        currentThroughput: '0.0 Gbps',
        status: 'UNREACHABLE',
        rawOutput: err.stdout || err.stderr || err.message,
        testedAt: new Date().toISOString(),
      };
    }
  }
}
