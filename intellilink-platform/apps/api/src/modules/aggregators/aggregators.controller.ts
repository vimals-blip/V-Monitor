import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AggregatorsService } from './aggregators.service';
import { CreateAggregatorsDto, UpdateAggregatorsDto } from './aggregator.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Aggregators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('aggregators')
export class AggregatorsController {
  constructor(private service: AggregatorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all aggregators' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get aggregator by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create aggregator' })
  create(@Body() dto: CreateAggregatorsDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update aggregator' })
  update(@Param('id') id: string, @Body() dto: UpdateAggregatorsDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete aggregator' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/probe')
  @ApiOperation({ summary: 'Probe live WireGuard daemon and kernel module health' })
  probe(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.probeAggregator(id, user);
  }
}
