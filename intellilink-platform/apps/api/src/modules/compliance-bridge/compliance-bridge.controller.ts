import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ComplianceBridgeService } from './compliance-bridge.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('compliance')
export class ComplianceBridgeController {
  constructor(private readonly complianceService: ComplianceBridgeService) {}

  @Public()
  @Get('summary')
  async getSummary() {
    return this.complianceService.getDashboardSummary();
  }

  @Public()
  @Get('tests')
  async getTests() {
    return this.complianceService.getTests();
  }

  @Public()
  @Post('tests/:id/run')
  async runTest(@Param('id') id: string) {
    return this.complianceService.runTest(id);
  }

  @Public()
  @Post('tests/run-all')
  async runAllTests() {
    return this.complianceService.runAllTests();
  }

  @Public()
  @Get('findings')
  async getFindings() {
    return this.complianceService.getFindings();
  }

  @Public()
  @Patch('findings/:id')
  async updateFindingStatus(
    @Param('id') id: string,
    @Body() body: { status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED'; notes?: string }
  ) {
    return this.complianceService.updateFindingStatus(id, body.status, body.notes);
  }

  @Public()
  @Get('risks')
  async getRisks() {
    return this.complianceService.getRisks();
  }

  @Public()
  @Get('audits')
  async getAudits() {
    return this.complianceService.getAudits();
  }

  @Public()
  @Get('evidence')
  async getEvidence() {
    return this.complianceService.getEvidence();
  }
}
