import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticResultEntity } from '../../entities/diagnostic-result.entity';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticsController } from './diagnostics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosticResultEntity])],
  providers: [DiagnosticsService],
  controllers: [DiagnosticsController],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}
