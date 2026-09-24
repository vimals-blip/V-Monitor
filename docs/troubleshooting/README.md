# NOC Troubleshooting Handbook

1. Gateway Heartbeat Timeout: Verify WAN reachability via `POST /api/v1/diagnostics/run` (type: PING).
2. WireGuard Tunnel Handshake Loss: Invoke `SimulatorTunnelProvider.resetHandshake(tunnelId)`.
3. Degraded Fiber WAN: Initiate automated failover to Starlink satellite backup via `POST /api/v1/automation/failover`.
