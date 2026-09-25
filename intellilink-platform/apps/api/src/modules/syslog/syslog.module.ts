import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyslogEntity } from '../../entities/syslog.entity';
import { SyslogService } from './syslog.service';
import { SyslogController } from './syslog.controller';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([SyslogEntity]), WebsocketModule],
  providers: [SyslogService],
  controllers: [SyslogController],
  exports: [SyslogService],
})
export class SyslogModule {}
