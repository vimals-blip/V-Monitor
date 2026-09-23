import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateRoutingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiProperty() @IsString() prefix: string;
  @ApiProperty() @IsString() nextHop: string;
  @ApiPropertyOptional() @IsOptional() @IsString() interfaceName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocol?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() metric?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() siteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() popId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gatewayId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateRoutingDto extends PartialType(CreateRoutingDto) {}
