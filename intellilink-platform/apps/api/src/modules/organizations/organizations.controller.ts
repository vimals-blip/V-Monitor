import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationsDto, UpdateOrganizationsDto } from './organization.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() dto: CreateOrganizationsDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationsDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
