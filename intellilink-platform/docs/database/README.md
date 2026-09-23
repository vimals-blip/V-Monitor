# Database Schema & Migrations

The database is built on PostgreSQL with UUID primary keys and temporal tracking on all records.

## Core Schema Relationships
- `organizations` (1) ── (N) `tenants`
- `tenants` (1) ── (N) `sites`
- `sites` (1) ── (N) `gateways`
- `gateways` (1) ── (N) `wan_links`
- `gateways` + `aggregators` ── `tunnels`
- `pops` (1) ── (N) `aggregators`

## Running Migrations & Seeding
```bash
# Run database seed
npm run seed -w apps/api

# Reset database schema
npm run db:reset -w apps/api
```
