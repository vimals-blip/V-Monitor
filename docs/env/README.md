# Environment Variables Specification

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | API server port | 3001 |
| `DATABASE_HOST` | PostgreSQL hostname | localhost / postgres |
| `DATABASE_PORT` | PostgreSQL port | 5432 |
| `DATABASE_NAME` | Database name | intellilink |
| `DATABASE_USER` | Database username | intellilink |
| `DATABASE_PASSWORD` | Database password | change_me_in_production |
| `REDIS_HOST` | Redis cache host | localhost / redis |
| `REDIS_PORT` | Redis cache port | 6379 |
| `JWT_SECRET` | 64-char JWT HMAC secret | random-string |
| `JWT_EXPIRATION` | Access token lifespan | 15m |
| `JWT_REFRESH_SECRET` | Refresh token secret | random-string |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifespan | 7d |
| `AI_SERVICE_URL` | Python FastAPI AI URL | http://localhost:8100 |
| `OLLAMA_BASE_URL` | Local LLM host | http://localhost:11434 |
| `TELEMETRY_SECRET` | Shared secret for gateway auth | random-secret |
