import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { RouteEntity } from '../../entities/route.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(@InjectRepository(RouteEntity) private repo: Repository<RouteEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: FindOptionsWhere<RouteEntity> = {};
    // Tenant isolation
    if (user.tenantId) (where as any).tenantId = user.tenantId;
    else (where as any).organizationId = user.organizationId;
    if (query.search) (where as any).prefix = Like(`%${query.search}%`);

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
    if (!entity) throw new NotFoundException('Routing not found');
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
}
