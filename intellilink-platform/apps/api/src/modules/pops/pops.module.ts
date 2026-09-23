import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopEntity } from '../../entities/pop.entity';
import { PopsService } from './pops.service';
import { PopsController } from './pops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PopEntity])],
  providers: [PopsService],
  controllers: [PopsController],
  exports: [PopsService],
})
export class PopsModule {}
