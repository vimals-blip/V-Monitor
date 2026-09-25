import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceBridgeService } from './compliance-bridge.service';
import { ComplianceBridgeController } from './compliance-bridge.controller';
import {
  TunnelEntity,
  WanLinkEntity,
  PopEntity,
  AuditLogEntity,
  GatewayEntity,
  SiteEntity
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TunnelEntity,
      WanLinkEntity,
      PopEntity,
      AuditLogEntity,
      GatewayEntity,
      SiteEntity
    ])
  ],
  controllers: [ComplianceBridgeController],
  providers: [ComplianceBridgeService],
  exports: [ComplianceBridgeService],
})
export class ComplianceBridgeModule {}
