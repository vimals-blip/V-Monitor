import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlaProfileEntity } from '../../entities/sla-profile.entity';
import { SlaService } from './sla.service';
import { SlaController } from './sla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SlaProfileEntity])],
  providers: [SlaService],
  controllers: [SlaController],
  exports: [SlaService],
})
export class SlaModule {}
