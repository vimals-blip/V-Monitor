import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  DeviceAutomationService,
  SshExecutionDto,
  NetconfRpcDto,
  TemplateRenderDto,
} from './device-automation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Device Automation (SSH, NETCONF & RESTCONF)')
@Controller('automation/device')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeviceAutomationController {
  constructor(private readonly automationService: DeviceAutomationService) {}

  @Post('ssh')
  @ApiOperation({ summary: 'Execute remote CLI command on Cisco, MikroTik, or Linux edge router via SSH' })
  async executeSsh(@Body() body: SshExecutionDto) {
    return this.automationService.executeSshCommand(body);
  }

  @Post('netconf')
  @ApiOperation({ summary: 'Dispatch RFC 6241 NETCONF XML RPC to edge router' })
  async dispatchNetconf(@Body() body: NetconfRpcDto) {
    return this.automationService.dispatchNetconfRpc(body);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List carrier golden config templates for Cisco, MikroTik, and Linux' })
  getTemplates() {
    return this.automationService.getTemplates();
  }

  @Post('templates/render')
  @ApiOperation({ summary: 'Render vendor-specific router configuration for Starlink LEO / 5G / Fiber multi-WAN' })
  renderTemplate(@Body() body: TemplateRenderDto) {
    const config = this.automationService.renderTemplate(body);
    return {
      vendor: body.vendor,
      siteName: body.siteName,
      config,
    };
  }
}
