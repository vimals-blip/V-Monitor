import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpPoolEntity } from '../../entities/ip-pool.entity';
import { IpamService } from './ipam.service';
import { IpamController } from './ipam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IpPoolEntity])],
  providers: [IpamService],
  controllers: [IpamController],
  exports: [IpamService],
})
export class IpamModule {}
