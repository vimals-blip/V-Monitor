import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({ description: 'User query or operational command' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Active chat session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class RcaRequestDto {
  @ApiProperty({ description: 'Target entity ID (site, gateway, wan link, or incident ID)' })
  @IsString()
  targetId: string;

  @ApiPropertyOptional({ enum: ['INCIDENT', 'SITE', 'GATEWAY', 'WAN_LINK', 'POP'] })
  @IsOptional()
  @IsString()
  targetType?: string;
}

export class AnomalyDetectDto {
  @ApiPropertyOptional({ description: 'Metric key to analyze (latencyMs, packetLossPercent, trafficInMbps, cpu)' })
  @IsOptional()
  @IsString()
  metricKey?: string;

  @ApiPropertyOptional({ description: 'Z-score threshold for anomaly flag (default 2.0)' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ description: 'Number of recent samples to analyze (default 100)' })
  @IsOptional()
  @IsNumber()
  sampleSize?: number;
}
