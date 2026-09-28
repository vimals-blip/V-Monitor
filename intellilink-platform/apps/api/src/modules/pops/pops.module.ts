import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopEntity } from '../../entities/pop.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { PopsService } from './pops.service';
import { PopsController } from './pops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PopEntity, TunnelEntity, WanLinkEntity, GatewayEntity])],
  providers: [PopsService],
  controllers: [PopsController],
  exports: [PopsService],
})
export class PopsModule {}

