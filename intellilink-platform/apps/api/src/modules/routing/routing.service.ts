import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { RouteEntity } from '../../entities/route.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execFileAsync = promisify(execFile);

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(@InjectRepository(RouteEntity) private repo: Repository<RouteEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<RouteEntity> = {};
    if (user?.tenantId) (where as any).tenantId = user.tenantId;
    else if (user?.organizationId) (where as any).organizationId = user.organizationId;
    if (query?.search) (where as any).prefix = Like(`%${query.search}%`);

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
    if (!entity) throw new NotFoundException('Route not found');
    if (user?.tenantId && (entity as any).tenantId !== user.tenantId) throw new ForbiddenException('Access denied');
    return entity;
  }

  async create(dto: any, user: any) {
    const entity = this.repo.create({
      id: uuidv4(),
      ...dto,
      organizationId: user?.organizationId || 'a7949357-0af2-4b5a-a820-aa3f323bd7f1',
      tenantId: dto.tenantId || user?.tenantId,
    });

    // Test kernel path
    try {
      const targetHost = dto.nextHop && dto.nextHop !== '0.0.0.0' ? dto.nextHop : dto.prefix?.split('/')[0];
      if (targetHost) {
        await execFileAsync('/usr/bin/ip', ['route', 'get', targetHost]);
      }
    } catch {}

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
    if (user?.tenantId) where.tenantId = user.tenantId;
    else if (user?.organizationId) where.organizationId = user.organizationId;
    return this.repo.count({ where });
  }

  async syncKernelRoutes(user: any) {
    this.logger.log('Synchronizing routing table directly from Linux kernel FIB...');
    try {
      const { stdout } = await execFileAsync('/usr/bin/ip', ['-j', 'route']);
      const kernelRoutes = JSON.parse(stdout || '[]');

      let syncedCount = 0;
      for (const kr of kernelRoutes) {
        const prefix = kr.dst === 'default' ? '0.0.0.0/0' : kr.dst;
        const nextHop = kr.gateway || kr.prefsrc || '0.0.0.0';
        const interfaceName = kr.dev || 'eno1';
        const protocol = kr.protocol === 'kernel' ? 'CONNECTED' : kr.protocol === 'static' ? 'STATIC' : 'BGP';
        const metric = kr.metric || 100;

        let existing = await this.repo.findOne({ where: { prefix } as any });
        if (existing) {
          existing.nextHop = nextHop;
          existing.interfaceName = interfaceName;
          existing.protocol = protocol as any;
          existing.metric = metric;
          existing.status = 'ACTIVE';
          await this.repo.save(existing);
        } else {
          const newRoute = this.repo.create({
            id: uuidv4(),
            organizationId: user?.organizationId || 'a7949357-0af2-4b5a-a820-aa3f323bd7f1',
            tenantId: user?.tenantId,
            prefix,
            nextHop,
            interfaceName,
            protocol: protocol as any,
            metric,
            status: 'ACTIVE',
          });
          await this.repo.save(newRoute);
        }
        syncedCount++;
      }

      return {
        success: true,
        syncedCount,
        kernelRoutesCount: kernelRoutes.length,
        kernelRaw: kernelRoutes,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
