import { Module } from '@nestjs/common';
import { AppEventsGateway } from './events.gateway';

@Module({
  providers: [AppEventsGateway],
  exports: [AppEventsGateway],
})
export class WebsocketModule {}
