import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSitesDto, UpdateSitesDto } from './site.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('sites')
export class SitesController {
  constructor(private service: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'List all sites' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get site by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create site' })
  create(@Body() dto: CreateSitesDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update site' })
  update(@Param('id') id: string, @Body() dto: UpdateSitesDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete site' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/provision')
  @ApiOperation({ summary: 'Provision site connectivity and tunnels' })
  async provision(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'ONLINE' }, user);
  }

  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable site (administrative shutdown)' })
  async disable(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'DISABLED' }, user);
  }

  @Post(':id/restart-gateway')
  @ApiOperation({ summary: 'Restart edge gateway associated with site' })
  async restartGateway(@Param('id') id: string, @CurrentUser() user: any) {
    return { status: 'RESTART_INITIATED', siteId: id, timestamp: new Date().toISOString() };
  }

  @Post(':id/diagnostics')
  @ApiOperation({ summary: 'Run automated end-to-end diagnostics on site' })
  async runDiagnostics(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.service.runSiteDiagnostics(id, body, user);
  }
}
