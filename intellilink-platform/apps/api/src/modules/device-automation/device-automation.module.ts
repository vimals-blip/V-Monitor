import { Module } from '@nestjs/common';
import { DeviceAutomationService } from './device-automation.service';
import { DeviceAutomationController } from './device-automation.controller';

@Module({
  providers: [DeviceAutomationService],
  controllers: [DeviceAutomationController],
  exports: [DeviceAutomationService],
})
export class DeviceAutomationModule {}
