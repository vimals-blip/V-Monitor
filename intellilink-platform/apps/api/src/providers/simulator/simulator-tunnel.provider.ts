import { Injectable, Logger } from '@nestjs/common';
import { ITunnelProvider } from '../interfaces/network-providers.interface';

@Injectable()
export class SimulatorTunnelProvider implements ITunnelProvider {
  private readonly logger = new Logger(SimulatorTunnelProvider.name);

  async getStatus(tunnelId: string): Promise<any> {
    return {
      tunnelId,
      status: 'UP',
      protocol: 'WIREGUARD',
      latencyMs: 24.2,
      jitterMs: 4.1,
      packetLossPercent: 0.1,
      bytesIn: 184502019,
      bytesOut: 94819204,
      lastHandshakeAt: new Date().toISOString(),
    };
  }

  async resetHandshake(tunnelId: string): Promise<void> {
    this.logger.log(`[Simulator] Reset WireGuard handshake for tunnel: ${tunnelId}`);
  }
}
