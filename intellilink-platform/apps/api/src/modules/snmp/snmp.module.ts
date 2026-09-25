import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnmpTrapEntity } from '../../entities/snmp-trap.entity';
import { SnmpService } from './snmp.service';
import { SnmpController } from './snmp.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([SnmpTrapEntity]), WebsocketModule],
  providers: [SnmpService],
  controllers: [SnmpController],
  exports: [SnmpService],
})
export class SnmpModule {}
