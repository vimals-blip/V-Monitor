import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAutomationDto {
  @ApiProperty() @IsString() name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() conditions?: any;
  @ApiPropertyOptional() @IsOptional() actions?: any;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cooldownSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class UpdateAutomationDto extends PartialType(CreateAutomationDto) {}
