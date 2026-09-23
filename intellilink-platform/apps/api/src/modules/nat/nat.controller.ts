import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NatService } from './nat.service';
import { CreateNatDto, UpdateNatDto } from './nat.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Nat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('nat')
export class NatController {
  constructor(private service: NatService) {}

  @Get()
  @ApiOperation({ summary: 'List all nat' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get nat by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create nat' })
  create(@Body() dto: CreateNatDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update nat' })
  update(@Param('id') id: string, @Body() dto: UpdateNatDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete nat' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Submit NAT rule for security review' })
  async review(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'REVIEW' }, user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve NAT rule change' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'APPROVED' }, user);
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: 'Deploy approved NAT rule to edge gateway / nftables' })
  async deploy(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'DEPLOYED' }, user);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify live packet translation and mark verified' })
  async verify(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.update(id, { status: 'VERIFIED' }, user);
  }
}
