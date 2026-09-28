import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { TunnelsService } from './tunnels.service';
import { TunnelsController } from './tunnels.controller';

import { GatewayEntity } from '../../entities/gateway.entity';
import { SiteEntity } from '../../entities/site.entity';
import { AggregatorEntity } from '../../entities/aggregator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TunnelEntity, GatewayEntity, SiteEntity, AggregatorEntity])],
  providers: [TunnelsService],
  controllers: [TunnelsController],
  exports: [TunnelsService],
})
export class TunnelsModule {}
