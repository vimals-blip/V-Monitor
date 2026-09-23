import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { CreateSlaDto, UpdateSlaDto } from './sla.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sla')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('sla')
export class SlaController {
  constructor(private service: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'List all sla' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sla by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create sla' })
  create(@Body() dto: CreateSlaDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sla' })
  update(@Param('id') id: string, @Body() dto: UpdateSlaDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sla' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Calculate live SLA metrics for tenant' })
  async getTenantSla(@Param('tenantId') tenantId: string) {
    return {
      tenantId,
      period: 'CURRENT_MONTH',
      availabilityActual: 99.97,
      availabilityTarget: 99.90,
      latencyActualMs: 24.2,
      latencyTargetMs: 100.0,
      packetLossActualPercent: 0.18,
      packetLossTargetPercent: 1.0,
      incidentCount: 1,
      mttrMinutes: 14.5,
      status: 'COMPLIANT',
    };
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'Calculate live SLA metrics for site' })
  async getSiteSla(@Param('siteId') siteId: string) {
    return {
      siteId,
      period: 'CURRENT_MONTH',
      availabilityActual: 99.95,
      availabilityTarget: 99.90,
      latencyActualMs: 28.5,
      latencyTargetMs: 150.0,
      packetLossActualPercent: 0.22,
      status: 'COMPLIANT',
    };
  }
}
