import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLogEntity) private repo: Repository<AuditLogEntity>) {}

  async findAll(query: PaginationDto, user: any) {
    const where: any = {};
    if (user.tenantId) where.tenantId = user.tenantId;
    else where.organizationId = user.organizationId;
    if (query.search) where.action = Like(`%${query.search}%`);

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: ((query.page || 1) - 1) * (query.pageSize || 20),
      take: query.pageSize || 20,
    });
    return paginate(data, total, query);
  }
}
