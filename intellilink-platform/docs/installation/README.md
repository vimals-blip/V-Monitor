# Installation Guide

## Prerequisites
- Node.js >= 20.0.0
- Python >= 3.10
- Docker & Docker Compose
- PostgreSQL 16 & Redis 7

## Bare-Metal / Local Installation
```bash
# 1. Install root & packages dependencies
npm install

# 2. Build shared packages
npm run build:types
for pkg in api-client config auth telemetry networking ui; do
  npx -p typescript tsc --project packages/$pkg/tsconfig.json
done

# 3. Setup Environment
cp .env.example .env

# 4. Start Docker dependencies (or local postgres/redis)
docker compose -f infra/docker/docker-compose.yml up postgres redis -d

# 5. Seed initial data
npm run seed -w apps/api

# 6. Start services
npm run dev
```
