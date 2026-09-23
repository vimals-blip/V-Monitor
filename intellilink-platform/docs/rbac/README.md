# Role-Based Access Control (RBAC) Matrix

| Role | Scope | Tenant Management | Network Changes | Diagnostics | AI NOC |
|---|---|---|---|---|---|
| `PROVIDER` | Global | Read/Write | Full | Allowed | Full |
| `PROVIDER_ADMIN`| Global | Full Admin | Full | Allowed | Full |
| `NOC_OPERATOR` | Global | Read/Audit | Operational | Allowed | Query/RCA |
| `TENANT_ADMIN` | Tenant | Self-Admin | Scoped | Allowed | Tenant-Only |
| `TENANT_OPERATOR`| Tenant | Read-Only | Restricted | Read-Only | Tenant-Only |
| `AUDITOR` | Global/Tenant | Read-Only | None | None | Audit-Only |
| `READ_ONLY` | Tenant | Read-Only | None | None | None |
