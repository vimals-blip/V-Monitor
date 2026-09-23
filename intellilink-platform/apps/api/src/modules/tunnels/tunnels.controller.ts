import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TunnelsService } from './tunnels.service';
import { CreateTunnelsDto, UpdateTunnelsDto } from './tunnel.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tunnels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('tunnels')
export class TunnelsController {
  constructor(private service: TunnelsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tunnels' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tunnel by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create tunnel' })
  create(@Body() dto: CreateTunnelsDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tunnel' })
  update(@Param('id') id: string, @Body() dto: UpdateTunnelsDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tunnel' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify live WireGuard tunnel handshake and keepalive' })
  verify(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.verifyTunnel(id, user);
  }
}
