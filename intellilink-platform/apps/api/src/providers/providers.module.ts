import { Module } from '@nestjs/common';
import { SimulatorGatewayProvider } from './simulator/simulator-gateway.provider';
import { SimulatorTunnelProvider } from './simulator/simulator-tunnel.provider';
import { SimulatorPopProvider } from './simulator/simulator-pop.provider';

@Module({
  providers: [
    SimulatorGatewayProvider,
    SimulatorTunnelProvider,
    SimulatorPopProvider,
  ],
  exports: [
    SimulatorGatewayProvider,
    SimulatorTunnelProvider,
    SimulatorPopProvider,
  ],
})
export class ProvidersModule {}
