import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyEntity } from '../../entities/policy.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyEntity, GatewayEntity])],
  providers: [PoliciesService],
  controllers: [PoliciesController],
  exports: [PoliciesService],
})
export class PoliciesModule {}
