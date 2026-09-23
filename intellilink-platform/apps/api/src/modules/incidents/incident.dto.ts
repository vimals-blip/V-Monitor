import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateIncidentsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() affectedSites?: any;
  @ApiPropertyOptional() @IsOptional() affectedTenants?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() rootCause?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resolution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() detectedBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateIncidentsDto extends PartialType(CreateIncidentsDto) {}
