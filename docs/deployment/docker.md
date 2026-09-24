# Production & Development Deployment Guide

## Quickstart (Development)
```bash
cd infra/docker
docker compose up -d
```

## Running Database Migrations and Seed Data
```bash
# Seed 10 tenants, 50 sites, 70 gateways, 4 PoPs, 8 aggregators, 100 tunnels
npm run db:seed
```

## Accessing Endpoints
- Web NOC Dashboard: `http://localhost:3000`
- API Swagger Docs: `http://localhost:3001/api/docs`
- AI Operations Engine: `http://localhost:8100/docs`
- Prometheus Metrics: `http://localhost:9090`
- Grafana Dashboards: `http://localhost:3100`
