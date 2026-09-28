import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { SiteEntity } from '../../entities/site.entity';
import { AggregatorsService } from './aggregators.service';
import { AggregatorsController } from './aggregators.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AggregatorEntity, TunnelEntity, GatewayEntity, SiteEntity])],
  providers: [AggregatorsService],
  controllers: [AggregatorsController],
  exports: [AggregatorsService],
})
export class AggregatorsModule {}

