import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallRuleEntity } from '../../entities/firewall-rule.entity';
import { FirewallService } from './firewall.service';
import { FirewallController } from './firewall.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FirewallRuleEntity])],
  providers: [FirewallService],
  controllers: [FirewallController],
  exports: [FirewallService],
})
export class FirewallModule {}
