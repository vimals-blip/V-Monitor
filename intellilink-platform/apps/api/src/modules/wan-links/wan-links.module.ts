import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { WanLinksService } from './wan-links.service';
import { WanLinksController } from './wan-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WanLinkEntity, GatewayEntity])],
  providers: [WanLinksService],
  controllers: [WanLinksController],
  exports: [WanLinksService],
})
export class WanLinksModule {}
