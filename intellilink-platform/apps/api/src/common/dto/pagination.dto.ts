import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] }) @IsOptional() @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC' = 'DESC';
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

export function paginate<T>(data: T[], total: number, dto: PaginationDto) {
  const pageSize = dto.pageSize || 20;
  const page = dto.page || 1;
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
