# Intellilink NOG Architecture Overview

The **Intellilink Network Operations & Governance (NOG) Platform** is a multi-tenant centralized control plane designed for high-scale enterprise connectivity operations.

## Data Plane vs Control Plane
- **Control Plane**: Next.js 14 Web UI, NestJS REST/WebSocket backend, Python AI & RCA engine, PostgreSQL relational store, Redis Streams event bus.
- **Data Plane**: Encrypted WireGuard/IPsec tunnels traversing Starlink Satellite and terrestrial Fiber WAN links terminating on ISP Governance PoP Aggregators and forwarding out through ISP Core.

## Multi-Tenancy Architecture
- Strict tenant logical isolation via `organization_id` and `tenant_id` mandatory scoping.
- Provider vs Tenant user RBAC separation across 7 granular security roles.
