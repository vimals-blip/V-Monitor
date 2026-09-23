import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAlertsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() severity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resourceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resourceName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metricName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() metricValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() threshold?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateAlertsDto extends PartialType(CreateAlertsDto) {}
