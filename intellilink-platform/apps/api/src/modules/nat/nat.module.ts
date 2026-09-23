import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatRuleEntity } from '../../entities/nat-rule.entity';
import { NatService } from './nat.service';
import { NatController } from './nat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NatRuleEntity])],
  providers: [NatService],
  controllers: [NatController],
  exports: [NatService],
})
export class NatModule {}
