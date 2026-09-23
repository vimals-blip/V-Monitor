export const STATUS_COLORS = {
  ONLINE: '#10B981',
  DEGRADED: '#F59E0B',
  OFFLINE: '#F43F5E',
  MAINTENANCE: '#64748B',
} as const;

export function formatThroughput(mbps: number): string {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(1)} Gbps`;
  }
  return `${mbps.toFixed(1)} Mbps`;
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}
