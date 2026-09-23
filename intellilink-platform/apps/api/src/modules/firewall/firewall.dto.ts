import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateFirewallDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destination?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocol?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ports?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() action?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priority?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() siteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateFirewallDto extends PartialType(CreateFirewallDto) {}
