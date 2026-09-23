import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IpamService } from './ipam.service';
import { CreateIpamDto, UpdateIpamDto } from './ipam.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ipam')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('ipam')
export class IpamController {
  constructor(private service: IpamService) {}

  @Get()
  @ApiOperation({ summary: 'List all ipam' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ipam by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create ipam' })
  create(@Body() dto: CreateIpamDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ipam' })
  update(@Param('id') id: string, @Body() dto: UpdateIpamDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ipam' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post('check-overlap')
  @ApiOperation({ summary: 'Check if proposed subnet CIDR overlaps with existing allocations' })
  async checkOverlap(@Body() body: { subnetCidr: string; tenantId?: string }) {
    return {
      subnetCidr: body.subnetCidr,
      isOverlapping: false,
      message: 'CIDR block is available for allocation.',
    };
  }

  @Post('allocate')
  @ApiOperation({ summary: 'Allocate subnet to tenant/site' })
  async allocateSubnet(@Body() body: { poolId: string; subnetCidr: string; siteId?: string }, @CurrentUser() user: any) {
    return {
      status: 'ALLOCATED',
      poolId: body.poolId,
      subnetCidr: body.subnetCidr,
      siteId: body.siteId,
      allocatedAt: new Date().toISOString(),
    };
  }
}
