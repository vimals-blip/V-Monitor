import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '../../entities/report.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { SiteEntity } from '../../entities/site.entity';
import { AlertEntity } from '../../entities/alert.entity';
import { IncidentEntity } from '../../entities/incident.entity';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEntity,
      GatewayEntity,
      SiteEntity,
      AlertEntity,
      IncidentEntity,
      MetricSampleEntity,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
