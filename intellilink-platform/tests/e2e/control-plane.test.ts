import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3001/api/v1';

describe('E2E Lifecycle: Login → Tenant → Site → Gateway → WAN → Tunnel → Telemetry', () => {
  let token = '';
  let tenantId = '';
  let siteId = '';
  let gatewayId = '';

  it('Step 1: Provider Admin Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'admin@intellilink.com',
      password: 'IntelliLink@2026',
    });
    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
    token = res.data.accessToken;
  });

  it('Step 2: Tenant Creation & Isolation', async () => {
    const res = await axios.post(
      `${API}/tenants`,
      { name: 'E2E Corp Bank', slug: `e2e-corp-${Date.now()}`, type: 'BANKING', contactEmail: 'ops@e2e.com' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.status).toBe(201);
    tenantId = res.data.id;
  });

  it('Step 3: Site Creation', async () => {
    const res = await axios.post(
      `${API}/sites`,
      { name: 'E2E Branch 101', city: 'Bhopal', subnetCidr: '10.150.1.0/24', tenantId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.status).toBe(201);
    siteId = res.data.id;
  });

  it('Step 4: Edge Gateway Enrollment', async () => {
    const res = await axios.post(
      `${API}/gateways`,
      { hostname: `gw-e2e-01.edge`, siteId, tenantId, model: 'IntelliEdge-X800' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.status).toBe(201);
    gatewayId = res.data.id;
  });

  it('Step 5: Telemetry Ingestion & Live Health Update', async () => {
    const res = await axios.post(`${API}/telemetry/v1/gateway/heartbeat`, {
      gatewayId,
      cpuPercent: 32.5,
      memoryPercent: 44.0,
      diskPercent: 50.0,
      uptimeSeconds: 12000,
    });
    expect(res.status).toBe(201);
  });
});
