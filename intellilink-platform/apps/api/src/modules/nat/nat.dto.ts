import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateNatDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinationAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() translatedAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocol?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourcePort?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinationPort?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() translatedPort?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() siteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() tenantId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateNatDto extends PartialType(CreateNatDto) {}
