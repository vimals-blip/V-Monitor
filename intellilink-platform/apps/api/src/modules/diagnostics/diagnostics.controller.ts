import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosticsService } from './diagnostics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Diagnostics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private service: DiagnosticsService) {}

  @Post('run')
  run(@Body() body: any, @CurrentUser() user: any) {
    return this.service.runDiagnostic(body, user);
  }

  @Get('history')
  getHistory(@CurrentUser() user: any) {
    return this.service.getHistory(user);
  }
}
