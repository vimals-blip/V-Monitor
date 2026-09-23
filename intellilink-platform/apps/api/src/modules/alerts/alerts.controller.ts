import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertsDto, UpdateAlertsDto } from './alert.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private service: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Post('live-audit')
  @ApiOperation({ summary: 'Audit live physical fleet telemetry and evaluate real alarms' })
  auditLiveFleetTelemetry(@CurrentUser() user: any) {
    return this.service.auditLiveFleetTelemetry(user);
  }

  @Post('purge-mock')
  @ApiOperation({ summary: 'Purge mock and synthetic alerts from database' })
  purgeMockAlerts(@CurrentUser() user: any) {
    return this.service.purgeMockAlerts(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create alert' })
  create(@Body() dto: CreateAlertsDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update alert' })
  update(@Param('id') id: string, @Body() dto: UpdateAlertsDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete alert' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
