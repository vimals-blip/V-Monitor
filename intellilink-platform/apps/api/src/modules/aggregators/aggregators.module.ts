import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatorEntity } from '../../entities/aggregator.entity';
import { AggregatorsService } from './aggregators.service';
import { AggregatorsController } from './aggregators.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AggregatorEntity])],
  providers: [AggregatorsService],
  controllers: [AggregatorsController],
  exports: [AggregatorsService],
})
export class AggregatorsModule {}
