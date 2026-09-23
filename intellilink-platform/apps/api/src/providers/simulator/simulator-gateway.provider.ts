import { Injectable, Logger } from '@nestjs/common';
import { IGatewayProvider } from '../interfaces/network-providers.interface';

@Injectable()
export class SimulatorGatewayProvider implements IGatewayProvider {
  private readonly logger = new Logger(SimulatorGatewayProvider.name);

  async getStatus(gatewayId: string): Promise<any> {
    return {
      gatewayId,
      status: 'ONLINE',
      cpuPercent: 24.5,
      memoryPercent: 41.2,
      diskPercent: 50.1,
      uptimeSeconds: 842000,
      timestamp: new Date().toISOString(),
    };
  }

  async restart(gatewayId: string): Promise<void> {
    this.logger.log(`[Simulator] Restarting edge gateway: ${gatewayId}`);
  }

  async applyConfiguration(gatewayId: string, config: Record<string, any>): Promise<void> {
    this.logger.log(`[Simulator] Applied configuration to gateway ${gatewayId}`);
  }
}
