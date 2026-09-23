import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTunnelsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocol?: string;
  @ApiProperty() @IsString() localEndpoint: string;
  @ApiProperty() @IsString() remoteEndpoint: string;
  @ApiPropertyOptional() @IsOptional() @IsString() localSubnet?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remoteSubnet?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gatewayId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() aggregatorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() wanLinkId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() siteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateTunnelsDto extends PartialType(CreateTunnelsDto) {}
