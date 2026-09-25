import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetflowRecordEntity } from '../../entities/netflow-record.entity';
import { NetflowService } from './netflow.service';
import { NetflowController } from './netflow.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([NetflowRecordEntity]), WebsocketModule],
  providers: [NetflowService],
  controllers: [NetflowController],
  exports: [NetflowService],
})
export class NetflowModule {}
