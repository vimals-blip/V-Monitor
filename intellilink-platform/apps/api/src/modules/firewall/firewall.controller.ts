import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirewallService } from './firewall.service';
import { CreateFirewallDto, UpdateFirewallDto } from './firewall.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Firewall')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('firewall')
export class FirewallController {
  constructor(private service: FirewallService) {}

  @Get()
  @ApiOperation({ summary: 'List all firewall' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get firewall by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create firewall' })
  create(@Body() dto: CreateFirewallDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update firewall' })
  update(@Param('id') id: string, @Body() dto: UpdateFirewallDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete firewall' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Simulate 5-tuple packet match against kernel ACL filter' })
  simulate(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.service.simulateRuleMatch(id, body, user);
  }
}
