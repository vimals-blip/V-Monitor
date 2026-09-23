import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricSampleEntity } from '../../entities/metric-sample.entity';
import { GatewayEntity } from '../../entities/gateway.entity';
import { WanLinkEntity } from '../../entities/wan-link.entity';
import { AnomalyDetectDto } from './ai.dto';

export interface AnomalyPoint {
  id: string;
  sourceId: string;
  sourceName?: string;
  sourceType: string;
  metricKey: string;
  value: number;
  baselineMean: number;
  baselineStdDev: number;
  zScore: number;
  deviationPercent: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  description: string;
}

export interface AnomalyAnalysisResult {
  metricKey: string;
  totalSamplesAnalyzed: number;
  baselineMean: number;
  baselineStdDev: number;
  thresholdZScore: number;
  anomaliesDetectedCount: number;
  anomalyRatePercent: number;
  status: 'NOMINAL' | 'ELEVATED_ANOMALIES' | 'CRITICAL_DEVIATION';
  anomalies: AnomalyPoint[];
  analyzedAt: string;
}

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    @InjectRepository(MetricSampleEntity) private metricRepo: Repository<MetricSampleEntity>,
    @InjectRepository(GatewayEntity) private gatewayRepo: Repository<GatewayEntity>,
    @InjectRepository(WanLinkEntity) private wanRepo: Repository<WanLinkEntity>,
  ) {}

  async detect(dto: AnomalyDetectDto): Promise<AnomalyAnalysisResult> {
    const metricKey = dto.metricKey || 'latencyMs';
    const threshold = dto.threshold || 2.0;
    const limit = Math.min(dto.sampleSize || 100, 500);

    this.logger.log(`Running statistical anomaly detection for metric=${metricKey}, threshold=${threshold}σ, samples=${limit}`);

    // Query real recent metric samples from MySQL
    const samples = await this.metricRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // Extract numerical values
    const dataPoints: Array<{ id: string; sourceId: string; sourceType: string; value: number; timestamp: Date }> = [];

    for (const s of samples) {
      const metricsObj = s.metrics || {};
      let val: number | undefined;

      if (metricKey === 'latencyMs') val = metricsObj.latencyMs;
      else if (metricKey === 'packetLossPercent') val = metricsObj.packetLossPercent;
      else if (metricKey === 'trafficInMbps') val = metricsObj.trafficInMbps;
      else if (metricKey === 'cpu') val = metricsObj.cpu;
      else if (metricKey === 'memory') val = metricsObj.memory;
      else if (metricsObj[metricKey] !== undefined) val = metricsObj[metricKey];

      if (typeof val === 'number' && !isNaN(val)) {
        dataPoints.push({
          id: s.id,
          sourceId: s.sourceId,
          sourceType: s.sourceType,
          value: val,
          timestamp: s.createdAt || s.timestamp || new Date(),
        });
      }
    }

    if (dataPoints.length < 5) {
      return {
        metricKey,
        totalSamplesAnalyzed: dataPoints.length,
        baselineMean: 0,
        baselineStdDev: 0,
        thresholdZScore: threshold,
        anomaliesDetectedCount: 0,
        anomalyRatePercent: 0,
        status: 'NOMINAL',
        anomalies: [],
        analyzedAt: new Date().toISOString(),
      };
    }

    // Compute Mean μ and Standard Deviation σ
    const values = dataPoints.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 0.001;

    // Cache source hostnames for readable anomaly reporting
    const gateways = await this.gatewayRepo.find({ take: 30 });
    const gwMap = new Map(gateways.map((g) => [g.id, g.hostname]));

    const anomalies: AnomalyPoint[] = [];

    for (const point of dataPoints) {
      const zScore = Math.abs(point.value - mean) / stdDev;
      if (zScore >= threshold) {
        const devPct = mean > 0 ? ((point.value - mean) / mean) * 100 : 0;
        const sourceName = gwMap.get(point.sourceId) || point.sourceId.substring(0, 12);
        const severity: 'CRITICAL' | 'WARNING' | 'INFO' =
          zScore > 3.0 ? 'CRITICAL' : zScore > 2.2 ? 'WARNING' : 'INFO';

        anomalies.push({
          id: point.id,
          sourceId: point.sourceId,
          sourceName,
          sourceType: point.sourceType,
          metricKey,
          value: Math.round(point.value * 100) / 100,
          baselineMean: Math.round(mean * 100) / 100,
          baselineStdDev: Math.round(stdDev * 100) / 100,
          zScore: Math.round(zScore * 100) / 100,
          deviationPercent: Math.round(devPct * 10) / 10,
          severity,
          timestamp: point.timestamp.toISOString(),
          description: `${sourceName} ${metricKey} spiked to ${point.value} (${Math.round(zScore * 10) / 10}σ deviation from ${Math.round(mean)} baseline)`,
        });
      }
    }

    const anomalyRate = (anomalies.length / dataPoints.length) * 100;
    const status =
      anomalies.some((a) => a.severity === 'CRITICAL')
        ? 'CRITICAL_DEVIATION'
        : anomalies.length > 0
          ? 'ELEVATED_ANOMALIES'
          : 'NOMINAL';

    return {
      metricKey,
      totalSamplesAnalyzed: dataPoints.length,
      baselineMean: Math.round(mean * 100) / 100,
      baselineStdDev: Math.round(stdDev * 100) / 100,
      thresholdZScore: threshold,
      anomaliesDetectedCount: anomalies.length,
      anomalyRatePercent: Math.round(anomalyRate * 10) / 10,
      status,
      anomalies,
      analyzedAt: new Date().toISOString(),
    };
  }
}
