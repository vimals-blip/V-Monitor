# Networking Adapters Architecture

The platform separates Control Plane logic from the Data Plane using an Adapter pattern.

## Supported Provider Interfaces
- `IGatewayProvider`: Edge gateway heartbeat, configuration push, and reboot.
- `ITunnelProvider`: WireGuard handshake reset, interface metric query.
- `IPopProvider`: Aggregate throughput, CPU, and capacity thresholds.
- `IRoutingProvider`: Dynamic static/BGP route injection.
- `IFirewallProvider`: Distributed nftables policy push.

## Simulator vs Production
- In Development: `SimulatorGatewayProvider`, `SimulatorTunnelProvider`, `SimulatorPopProvider` simulate network state transitions.
- In Production: Connect to Intellilink ISP core using NETCONF / RESTCONF / gNMI adapters.
