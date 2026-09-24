import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoutingService } from './routing.service';
import { CreateRoutingDto, UpdateRoutingDto } from './routing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Routing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('routing')
export class RoutingController {
  constructor(private service: RoutingService) {}

  @Get()
  @ApiOperation({ summary: 'List all routing' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routing by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create routing' })
  create(@Body() dto: CreateRoutingDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update routing' })
  update(@Param('id') id: string, @Body() dto: UpdateRoutingDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Post('sync-kernel')
  @ApiOperation({ summary: 'Sync routing table with live Linux kernel FIB' })
  syncKernel(@CurrentUser() user: any) {
    return this.service.syncKernelRoutes(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete routing' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
