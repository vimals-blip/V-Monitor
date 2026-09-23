import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TunnelEntity } from '../../entities/tunnel.entity';
import { TunnelsService } from './tunnels.service';
import { TunnelsController } from './tunnels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TunnelEntity])],
  providers: [TunnelsService],
  controllers: [TunnelsController],
  exports: [TunnelsService],
})
export class TunnelsModule {}
