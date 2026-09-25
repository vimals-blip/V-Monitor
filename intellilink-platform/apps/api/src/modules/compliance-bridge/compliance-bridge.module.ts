import { Module } from '@nestjs/common';
import { ComplianceBridgeService } from './compliance-bridge.service';
import { ComplianceBridgeController } from './compliance-bridge.controller';

@Module({
  controllers: [ComplianceBridgeController],
  providers: [ComplianceBridgeService],
  exports: [ComplianceBridgeService],
})
export class ComplianceBridgeModule {}
