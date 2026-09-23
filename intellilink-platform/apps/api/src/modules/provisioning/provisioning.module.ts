import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../../entities/site.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { RouteEntity } from '../../entities/route.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningController } from './provisioning.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteEntity,
      GatewayEntity,
      TunnelEntity,
      RouteEntity,
      WanLinkEntity,
    ]),
  ],
  providers: [ProvisioningService],
  controllers: [ProvisioningController],
  exports: [ProvisioningService],
})
export class ProvisioningModule {}
