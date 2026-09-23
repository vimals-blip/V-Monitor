import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationVersionEntity } from '../../entities/configuration-version.entity';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigurationVersionEntity])],
  providers: [ConfigurationService],
  controllers: [ConfigurationController],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
