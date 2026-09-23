import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayEntity } from '../../entities/gateway.entity';
import { ConfigurationVersionEntity } from '../../entities/configuration-version.entity';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GatewayEntity, ConfigurationVersionEntity, AuditLogEntity])],
  providers: [GatewaysService],
  controllers: [GatewaysController],
  exports: [GatewaysService],
})
export class GatewaysModule {}
