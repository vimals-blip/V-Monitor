import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3001/api/v1';

describe('Security: Strict Tenant Isolation & RBAC Protection', () => {
  let tenant1Token = '';
  let tenant2Token = '';
  let tenant2SiteId = '';

  beforeAll(async () => {
    // Authenticate tenant 1
    const t1 = await axios.post(`${API}/auth/login`, {
      email: 'tenant1@intellilink.com',
      password: 'IntelliLink@2026',
    });
    tenant1Token = t1.data.accessToken;

    // Authenticate tenant 2
    const t2 = await axios.post(`${API}/auth/login`, {
      email: 'tenant2@intellilink.com',
      password: 'IntelliLink@2026',
    });
    tenant2Token = t2.data.accessToken;

    // Create resource in tenant 2
    const site = await axios.post(
      `${API}/sites`,
      { name: 'Confidential Site Tenant 2', city: 'Mumbai' },
      { headers: { Authorization: `Bearer ${tenant2Token}` } }
    );
    tenant2SiteId = site.data.id;
  });

  it('Denies Tenant 1 from accessing Tenant 2 site directly (Cross-Tenant Breach)', async () => {
    try {
      await axios.get(`${API}/sites/${tenant2SiteId}`, {
        headers: { Authorization: `Bearer ${tenant1Token}` },
      });
      throw new Error('Should have failed');
    } catch (err: any) {
      expect([403, 404]).toContain(err.response?.status);
    }
  });

  it('Rejects invalid JWT tokens with 401 Unauthorized', async () => {
    try {
      await axios.get(`${API}/tenants`, {
        headers: { Authorization: 'Bearer forged.invalid.token' },
      });
      throw new Error('Should have failed');
    } catch (err: any) {
      expect(err.response?.status).toBe(401);
    }
  });
});
