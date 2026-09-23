import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../../entities/site.entity';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteEntity])],
  providers: [SitesService],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
