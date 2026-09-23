import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WanLinksService } from './wan-links.service';
import { CreateWanLinksDto, UpdateWanLinksDto } from './wan_link.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('WanLinks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('wan-links')
export class WanLinksController {
  constructor(private service: WanLinksService) {}

  @Get()
  @ApiOperation({ summary: 'List all wan-links' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wan_link by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create wan_link' })
  create(@Body() dto: CreateWanLinksDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update wan_link' })
  update(@Param('id') id: string, @Body() dto: UpdateWanLinksDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete wan_link' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/benchmark')
  @ApiOperation({ summary: 'Run real ICMP probe & bandwidth benchmark against target circuit' })
  benchmark(
    @Param('id') id: string,
    @Body() body: { targetMode?: 'GATEWAY_CPE' | 'INTERNET_BACKBONE' | 'LOCAL_LOOPBACK'; targetHost?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.benchmarkCircuit(id, body, user);
  }
}
