export class IntellilinkClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL = 'http://localhost:3001/api/v1', token?: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'API request failed');
    }

    return res.json();
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Dashboard & Telemetry
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  async sendHeartbeat(data: any) {
    return this.request('/telemetry/v1/gateway/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMetrics(sourceType: string, data: any) {
    return this.request(`/telemetry/v1/${sourceType}/metrics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic CRUD
  async list(resource: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/${resource}${query}`);
  }

  async get(resource: string, id: string) {
    return this.request(`/${resource}/${id}`);
  }

  async create(resource: string, data: any) {
    return this.request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(resource: string, id: string, data: any) {
    return this.request(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(resource: string, id: string) {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }
}
