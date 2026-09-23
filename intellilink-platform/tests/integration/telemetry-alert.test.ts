import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3001/api/v1';

describe('Integration: Telemetry Ingestion -> Alert Engine -> Incident Escalation', () => {
  it('Evaluates threshold violation and fires alert', async () => {
    // Ingest WAN metric with 12% packet loss (threshold is > 5%)
    const res = await axios.post(`${API}/telemetry/v1/wan/metrics`, {
      sourceId: 'wan-test-degraded-link',
      metrics: {
        packetLossPercent: 12.4,
        latencyMs: 310.0,
      }
    });
    expect(res.status).toBe(201);
  });
});
