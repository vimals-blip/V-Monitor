import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

  async findAll(user: any) {
    if (user.tenantId) {
      return this.repo.find({ where: { tenantId: user.tenantId } });
    }
    return this.repo.find({ where: { organizationId: user.organizationId } });
  }

  async findOne(id: string) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async create(data: any, currentUser: any) {
    const hash = await bcrypt.hash(data.password || 'IntelliLink@2026', 10);
    const u = this.repo.create({
      ...data,
      passwordHash: hash,
      organizationId: currentUser.organizationId,
      tenantId: data.tenantId || currentUser.tenantId,
    });
    return this.repo.save(u);
  }
}
