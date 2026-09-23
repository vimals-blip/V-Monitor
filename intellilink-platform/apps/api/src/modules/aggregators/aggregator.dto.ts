import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAggregatorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiProperty() @IsString() hostname: string;
  @ApiProperty() @IsString() ipAddress: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() popId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() version?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxTunnels?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxBandwidthMbps?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateAggregatorsDto extends PartialType(CreateAggregatorsDto) {}
