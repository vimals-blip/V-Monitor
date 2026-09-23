import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteEntity } from '../../entities/route.entity';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RouteEntity])],
  providers: [RoutingService],
  controllers: [RoutingController],
  exports: [RoutingService],
})
export class RoutingModule {}
