import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { CreateAutomationDto, UpdateAutomationDto } from './automation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('automation')
export class AutomationController {
  constructor(private service: AutomationService) {}

  @Get()
  @ApiOperation({ summary: 'List all automation rules' })
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get('runs')
  @ApiOperation({ summary: 'List all historical automation execution runs' })
  getRuns(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.service.getRuns(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get automation rule by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create automation rule' })
  create(@Body() dto: CreateAutomationDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update automation rule' })
  update(@Param('id') id: string, @Body() dto: UpdateAutomationDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete automation rule' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger an automation rule run' })
  async triggerRule(@Param('id') id: string, @Body() payload: any, @CurrentUser() user: any) {
    return this.service.executeRule(id, user, payload);
  }
}
