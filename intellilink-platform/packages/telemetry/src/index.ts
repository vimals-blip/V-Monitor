export function calculateSla(uptimeMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 100.0;
  return Number(((uptimeMinutes / totalMinutes) * 100).toFixed(3));
}

export function evaluateHealthStatus(metrics: { packetLoss?: number; latency?: number; cpu?: number }): 'HEALTHY' | 'DEGRADED' | 'DOWN' {
  if ((metrics.packetLoss && metrics.packetLoss > 5.0) || (metrics.latency && metrics.latency > 250)) {
    return 'DEGRADED';
  }
  if (metrics.cpu && metrics.cpu > 90) {
    return 'DEGRADED';
  }
  return 'HEALTHY';
}
