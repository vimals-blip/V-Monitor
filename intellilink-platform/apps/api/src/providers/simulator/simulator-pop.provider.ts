import { Injectable } from '@nestjs/common';
import { IPopProvider } from '../interfaces/network-providers.interface';

@Injectable()
export class SimulatorPopProvider implements IPopProvider {
  async getHealth(popId: string): Promise<any> {
    return {
      popId,
      throughputGbps: 18.4,
      capacityGbps: 40.0,
      utilizationPercent: 46.0,
      activeTunnels: 1240,
      status: 'ONLINE',
    };
  }
}
