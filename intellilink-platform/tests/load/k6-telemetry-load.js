import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 concurrent edge gateways
    { duration: '1m', target: 100 },  // Stress at 100 concurrent edge gateways
    { duration: '30s', target: 0 },   // Ramp-down
  ],
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export default function () {
  const payload = JSON.stringify({
    gatewayId: `gw-bench-${__VU}-${__ITER}`,
    cpuPercent: 28.5,
    memoryPercent: 41.2,
    diskPercent: 52.0,
    uptimeSeconds: 84000,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/telemetry/v1/gateway/heartbeat`, payload, params);

  check(res, {
    'status is 201 or 200': (r) => r.status === 200 || r.status === 201,
    'latency under 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
